// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"backend/node/async-await.mdx": () => import("../../../content/backend/node/async-await.mdx?collection=docs"), "backend/node/event-loop.mdx": () => import("../../../content/backend/node/event-loop.mdx?collection=docs"), "database/sql/indexes.mdx": () => import("../../../content/database/sql/indexes.mdx?collection=docs"), "database/sql/queries.mdx": () => import("../../../content/database/sql/queries.mdx?collection=docs"), "database/sql/transactions.mdx": () => import("../../../content/database/sql/transactions.mdx?collection=docs"), "frontend/javascript/closures.mdx": () => import("../../../content/frontend/javascript/closures.mdx?collection=docs"), "frontend/react/rendering.mdx": () => import("../../../content/frontend/react/rendering.mdx?collection=docs"), "frontend/react/hook/use-effect.mdx": () => import("../../../content/frontend/react/hook/use-effect.mdx?collection=docs"), "frontend/react/hook/use-state.mdx": () => import("../../../content/frontend/react/hook/use-state.mdx?collection=docs"), }),
};
export default browserCollections;