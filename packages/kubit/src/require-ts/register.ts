import { register } from './index';

const CWD = process.env.REQUIRE_TS_CWD || process.cwd();
register(CWD, {
  cache: !!process.env.REQUIRE_TS_CACHE,
});
