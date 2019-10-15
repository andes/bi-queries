import { get } from '@loopback/rest';
import { Query } from '../models/query';


export class QueryController {
  @get('/query/{nombre}')
  nombre(): string {
    @param.path.string('nombres') nombres;
    Query.find({ where: { nombre: nombres } }).then(query => {

    });;
  }
}
