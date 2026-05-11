// @ts-nocheck
import * as __fd_glob_9 from "../../../content/frontend/react/hook/use-state.mdx?collection=docs"
import * as __fd_glob_8 from "../../../content/frontend/react/hook/use-effect.mdx?collection=docs"
import * as __fd_glob_7 from "../../../content/frontend/react/rendering.mdx?collection=docs"
import * as __fd_glob_6 from "../../../content/frontend/javascript/closures.mdx?collection=docs"
import * as __fd_glob_5 from "../../../content/database/sql/transactions.mdx?collection=docs"
import * as __fd_glob_4 from "../../../content/database/sql/queries.mdx?collection=docs"
import * as __fd_glob_3 from "../../../content/database/sql/indexes.mdx?collection=docs"
import * as __fd_glob_2 from "../../../content/backend/node/event-loop.mdx?collection=docs"
import * as __fd_glob_1 from "../../../content/backend/node/async-await.mdx?collection=docs"
import { default as __fd_glob_0 } from "../../../content/roadmaps/frontend.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "../../content", {"roadmaps/frontend.json": __fd_glob_0, }, {"backend/node/async-await.mdx": __fd_glob_1, "backend/node/event-loop.mdx": __fd_glob_2, "database/sql/indexes.mdx": __fd_glob_3, "database/sql/queries.mdx": __fd_glob_4, "database/sql/transactions.mdx": __fd_glob_5, "frontend/javascript/closures.mdx": __fd_glob_6, "frontend/react/rendering.mdx": __fd_glob_7, "frontend/react/hook/use-effect.mdx": __fd_glob_8, "frontend/react/hook/use-state.mdx": __fd_glob_9, });