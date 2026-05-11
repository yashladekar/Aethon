/**
 * Build-time validation script for roadmap JSON data files.
 * Validates all JSON files in content/roadmaps/ against the roadmapDocumentSchema.
 *
 * Usage: node --experimental-strip-types packages/roadmap-engine/src/scripts/validate-roadmaps.ts
 * Or via vitest: pnpm --filter @aethon/roadmap-engine validate:roadmaps
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { roadmapDocumentSchema } from '../schema/roadmap-document.schema.js';

const ROADMAPS_DIR = resolve(
    import.meta.dirname,
    '../../../../content/roadmaps',
);

function validateRoadmaps(): void {
    if (!existsSync(ROADMAPS_DIR)) {
        console.error(`❌ Roadmaps directory not found: ${ROADMAPS_DIR}`);
        process.exit(1);
    }

    const files = readdirSync(ROADMAPS_DIR).filter((f) => f.endsWith('.json'));

    if (files.length === 0) {
        console.warn('⚠️  No roadmap JSON files found in content/roadmaps/');
        process.exit(0);
    }

    let hasErrors = false;

    for (const file of files) {
        const filePath = join(ROADMAPS_DIR, file);
        const raw = readFileSync(filePath, 'utf-8');

        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch (err) {
            console.error(`❌ ${file}: Invalid JSON — ${(err as Error).message}`);
            hasErrors = true;
            continue;
        }

        const result = roadmapDocumentSchema.safeParse(parsed);

        if (!result.success) {
            console.error(`❌ ${file}: Schema validation failed`);
            for (const issue of result.error.issues) {
                console.error(
                    `   → [${issue.path.join('.')}] ${issue.message}`,
                );
            }
            hasErrors = true;
        } else {
            console.log(`✅ ${file}: Valid (${result.data.nodes.length} nodes, ${result.data.edges.length} edges)`);
        }
    }

    if (hasErrors) {
        process.exit(1);
    }

    console.log('\n✅ All roadmap files are valid.');
}

validateRoadmaps();
