declare module '@ioc:Kubit/View' {
  import { EdgeContract, EdgeRendererContract } from 'edge.js';

  export interface ViewContract extends EdgeContract {}
  export interface ViewRendererContract extends EdgeRendererContract {}

  export {
    TagContract,
    ParserContract,
    EdgeBufferContract,
    TagTokenContract,
    TemplateConstructorContract,
  } from 'edge.js';

  const View: ViewContract;
  export default View;
}
