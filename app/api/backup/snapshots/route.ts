import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');
const SNAPSHOTS_DIR = path.join(process.cwd(), 'prisma', 'snapshots');

// Ensure directory exists
if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

export async function GET() {
    const session = await getSession();
    if (!session || session.employee.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    try {
        const files = fs.readdirSync(SNAPSHOTS_DIR)
            .filter(f => f.endsWith('.db'))
            .map(f => {
                const stats = fs.statSync(path.join(SNAPSHOTS_DIR, f));
                return {
                    name: f,
                    size: stats.size,
                    createdAt: stats.birthtime.toISOString()
                };
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(files);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.employee.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    try {
        const { action, name } = await request.json();

        if (action === 'CREATE') {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const snapshotName = `manual_${timestamp}.db`;
            const dest = path.join(SNAPSHOTS_DIR, snapshotName);

            if (!fs.existsSync(DB_PATH)) {
                return NextResponse.json({ error: 'Source database not found' }, { status: 404 });
            }

            fs.copyFileSync(DB_PATH, dest);
            return NextResponse.json({ success: true, name: snapshotName });
        }

        if (action === 'RESTORE') {
            if (!name) return NextResponse.json({ error: 'Snapshot name required' }, { status: 400 });
            const source = path.join(SNAPSHOTS_DIR, name);

            if (!fs.existsSync(source)) {
                return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
            }

            // Safety check: created a snapshot of the CURRENT state before overwriting
            const safetyName = `auto_before_restore_${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
            if (fs.existsSync(DB_PATH)) {
                fs.copyFileSync(DB_PATH, path.join(SNAPSHOTS_DIR, safetyName));
            }

            // Restore: copy snapshot back to dev.db
            fs.copyFileSync(source, DB_PATH);

            return NextResponse.json({ success: true });
        }

        if (action === 'DELETE') {
            if (!name) return NextResponse.json({ error: 'Snapshot name required' }, { status: 400 });
            const target = path.join(SNAPSHOTS_DIR, name);

            if (fs.existsSync(target)) {
                fs.unlinkSync(target);
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Snapshot Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
