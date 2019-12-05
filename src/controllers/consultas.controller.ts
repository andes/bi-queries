import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
  STRING,
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
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

export class ConsultasController {
  constructor(
    @repository(ConsultasRepository)
    public consultasRepository: ConsultasRepository,
  ) { }


  // : Promise<Count> {
  //   return this.consultasRepository.updateAll(consultas, where);
  // }
  @get('/getConsultas')
  async getConsultas(

  ): Promise<any> {
    let data: any = await this.consultasRepository.find();
    console.log("Entraaaa: ", data);
    return data;
  }

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
    // @param.path.string('params') params: string
  ) {
    console.log("Nombre papa: ", nombre);
    // console.log("Parametrosssss: ", params);
    let data: any = await this.consultasRepository.find({ where: { nombre: nombre } });

    if (!this.consultasRepository.dataSource.connected) { await this.consultasRepository.dataSource.connect(); }
    var res = await this.consultasRepository.dataSource.connector!.connect(async function (err, db) {
      var collection = db.collection(data[0].coleccion); //name of db collection

      let fechas = [{
        fecha: '2019-11-10'
      }, {
        fecha: '2019-11-12'
      }];

      let datosArgumentos = data[0].argumentos;
      console.log("Argumentos: ", datosArgumentos);

      let objeto = JSON.parse(data[0].query);

      datosArgumentos.forEach((d: any) => {
        console.log("Entra a datos Argumentos: ", d);
        let index = data[0].argumentos.findIndex((a: any) => a.etiqueta === d.etiqueta);
        let replace;
        d.value = fechas[index].fecha;
        console.log("D Value: ", d.value);
        switch (data[0].argumentos[index].tipo) {
          case 'date':
            replace = parseDate(d.value);
            break;
        }
        data[0].argumentos[index]['dato'] = replace;
        console.log("Datata de cero: ", data[0].argumentos[index]['dato']);
        findValues(objeto, d.key, replace);
      });

      function parseDate(fecha: any) {
        console.log("Entra a parseDate");
        let x = Date.parse(fecha);
        return new Date(x);
      }

      function findValues(obj: any, key: any, argumentos: any) {
        console.log("Entra a findValues");
        return findValuesHelper(obj, key, argumentos);
      }

      function findValuesHelper(obj: any, key: any, data: any) {
        console.log("Entra a findValuesHelper: ", JSON.stringify(obj) + ' -- ' + key + ' -- ' + data);

        if (!obj) { return; }

        if (obj instanceof Array) {
          console.log("Entra a Instance of");
          for (let i in obj) {
            findValuesHelper(obj[i], key, data);
          }
          return;
        }

        if (obj[key]) {
          console.log("Adentroooooo OBJ[KEYYY] ANtes: ", obj[key]);
          obj[key] = data;
          console.log("Adentroooooo OBJ[KEYYY] Despúes: ", obj[key]);
        }
        if ((typeof obj === 'object') && (obj !== null)) {
          console.log("Entra a typeof oBJEcttt");
          let children = Object.keys(obj);
          console.log("Childrennnn: ", children);
          if (children.length > 0) {
            for (let i = 0; i < children.length; i++) {
              findValuesHelper(obj[children[i]], key, data);
            }
          }
        }
        return;
      }

      console.log('objeto despues', JSON.stringify(objeto));

      var respuesta = await collection.aggregate(objeto);

      let pipe = await respuesta.toArray();
      console.log("Pepepepe: ", pipe);

      console.log('res', res); // undefined

      return await respuesta.toArray();
    });

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
            exclude: ['_id'],
          }),
        },
      },
    })
    consultas: Omit<Consultas, '_id'>,
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

  @get('/consultas/{_id}', {
    responses: {
      '200': {
        description: 'Consultas model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Consultas) } },
      },
    },
  })
  async findById(@param.path.string('_id') _id: string): Promise<Consultas> {
    return this.consultasRepository.findById(_id);
  }

  @patch('/consultas/{_id}', {
    responses: {
      '204': {
        description: 'Consultas PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('_id') _id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Consultas, { partial: true }),
        },
      },
    })
    consultas: Consultas,
  ): Promise<void> {
    await this.consultasRepository.updateById(_id, consultas);
  }

  @put('/consultas/{_id}', {
    responses: {
      '204': {
        description: 'Consultas PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('_id') _id: string,
    @requestBody() consultas: Consultas,
  ): Promise<void> {
    await this.consultasRepository.replaceById(_id, consultas);
  }

  @del('/consultas/{_id}', {
    responses: {
      '204': {
        description: 'Consultas DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('_id') _id: string): Promise<void> {
    await this.consultasRepository.deleteById(_id);
  }
}
