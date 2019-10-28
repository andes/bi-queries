import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { Consultas } from '../models';
import { ConsultasRepository } from '../repositories';
import * as moment from 'moment';
import { watchFile } from 'fs';
export class ConsultasController {
  constructor(
    @repository(ConsultasRepository)
    public consultasRepository: ConsultasRepository,
  ) { }

  @get('/consultas/{nombre}', {
    responses: {
      '200': {
        description: 'Devuelve la consulta en mongo que tiene ese nombre',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Consultas) },
          },
        },
      },
    },
  })
  async querybyName(
    @param.path.string('nombre') nombre: string,
  ) {
    let data: any = await this.consultasRepository.find({ where: { nombre: nombre } });
    console.log('la data: ', data);
    if (!this.consultasRepository.dataSource.connected) { await this.consultasRepository.dataSource.connect(); }
    // let result = await this.consultasRepository.dataSource.connector!.client(this.consultasRepository.dataSource.settings.database).collection('agenda')
    //   .aggregate([
    //     { "$match": {} }
    //   ]);
    // const result = await new Promise((resolve, reject) => {
    //   this.consultasRepository.dataSource.execute('agenda', 'aggregate', [
    //     { "$match": {} }
    //   ]//,
    //     // (err, data) => {
    //     //   if (err) reject(err);
    //     //   else resolve(data);
    //     // });
    // });
    var res = await this.consultasRepository.dataSource.connector!.connect(async function (err, db) {
      // console.log('entro al connect');
      var collection = db.collection(data[0].coleccion); //name of db collection
      console.log('data.query ', data[0]);
      // console.log('collection ', collection);


      var respuesta = await collection.aggregate([{ $match: { createdAt: { $gte: moment('2019-10-11 12:30:00.000-03:00').toDate() } } }, { $limit: 5 }]);
      // TODO: como se cual es la fecha por la que debo reemplazar "fechaInicio"? Conviene pasar por parametros un fechaInicio=fecha y reemplazo fecha en fechaInicio en el string del aggregate?
      console.log('respuesta: ', await respuesta.toArray()); // la obtengo bien

      return await respuesta.toArray();
    });
    console.log('res', res); // undefined
    return res;
  }

  wait(ms: number) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
      end = new Date().getTime();
    }
  }


  @post('/consultas', {
    responses: {
      '200': {
        description: 'Consultas model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Consultas) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Consultas, {
            title: 'NewConsultas',
            exclude: ['id'],
          }),
        },
      },
    })
    consultas: Omit<Consultas, 'id'>,
  ): Promise<Consultas> {
    return this.consultasRepository.create(consultas);
  }

  @get('/consultas/count', {
    responses: {
      '200': {
        description: 'Consultas model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Consultas)) where?: Where<Consultas>,
  ): Promise<Count> {
    return this.consultasRepository.count(where);
  }

  @get('/consultas', {
    responses: {
      '200': {
        description: 'Array of Consultas model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Consultas) },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Consultas)) filter?: Filter<Consultas>,
  ): Promise<Consultas[]> {
    return this.consultasRepository.find(filter);
  }

  @patch('/consultas', {
    responses: {
      '200': {
        description: 'Consultas PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Consultas, { partial: true }),
        },
      },
    })
    consultas: Consultas,
    @param.query.object('where', getWhereSchemaFor(Consultas)) where?: Where<Consultas>,
  ): Promise<Count> {
    return this.consultasRepository.updateAll(consultas, where);
  }

  @get('/consultas/{id}', {
    responses: {
      '200': {
        description: 'Consultas model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Consultas) } },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Consultas> {
    return this.consultasRepository.findById(id);
  }

  @patch('/consultas/{id}', {
    responses: {
      '204': {
        description: 'Consultas PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Consultas, { partial: true }),
        },
      },
    })
    consultas: Consultas,
  ): Promise<void> {
    await this.consultasRepository.updateById(id, consultas);
  }

  @put('/consultas/{id}', {
    responses: {
      '204': {
        description: 'Consultas PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() consultas: Consultas,
  ): Promise<void> {
    await this.consultasRepository.replaceById(id, consultas);
  }

  @del('/consultas/{id}', {
    responses: {
      '204': {
        description: 'Consultas DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.consultasRepository.deleteById(id);
  }
}
