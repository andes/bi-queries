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
// const createCsvWriter = require('csv-writer').createArrayCsvStringifier;
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

export class ConsultasController {
  constructor(
    @repository(ConsultasRepository)
    public consultasRepository: ConsultasRepository,
  ) { }


  // : Promise<Count> {
  //   return this.consultasRepository.updateAll(consultas, where);
  // }
  @get('/getConsultas')
  async getConsultas(): Promise<any> {
    let data: any = await this.consultasRepository.find();
    console.log("Entraaaa: ", data);
    return data;
  }

  @post('/descargarCSV')
  descargarCSV() {
    // console.log("Respuestaaaa: ", JSON.stringify(nombre));
    let capo: any;

    // if (!this.consultasRepository.dataSource.connected) { await this.consultasRepository.dataSource.connect(); }
    let res = this.consultasRepository.dataSource.connector!.connect(async function (err, db) {
      console.log("DBBBBBBBB: ", db);
      let datos: any = {
        params: {
          _id: "5de903a501ecb1b3367d7f51",
          nombre: "Listado de Pacientes",
          coleccion: "paciente",
          query: [{ '$match': { '$and': [{ 'createdAt': { '$gte': '@fechaInicio', '$lte': '@fechaFin' } }] } }, { '$addFields': { 'dire': { '$slice': ['$direccion', 0, 1] } } }, { '$unwind': '$dire' }, { '$project': { '_id': 1, 'nombre': 1, 'apellido': 1, 'documento': 1, 'sexo': 1, 'fechaNacimiento': 1, 'provincia': '$dire.ubicacion.provincia.nombre', 'localidad': '$dire.ubicacion.localidad.nombre', 'calle': '$dire.valor', 'pais': '$dire.ubicacion.pais.nombre' } }],
          argumentos: [
            {
              key: "$gte",
              label: "Fecha de Inicio",
              param: "@fechaInicio",
              tipo: "date",
              componente: "FechaComponent",
              nombre: "fechaInicio",
              valor: "2019-12-06T15:56:51.785-03:00"
            },
            {
              key: "$lte",
              label: "Fecha de Fin",
              param: "@fechaFin",
              tipo: "date",
              componente: "FechaComponent",
              nombre: "fechaFin",
              valor: "2019-12-09T15:56:51.785-03:00"
            }
          ]
        }
      };

      var collection = db.collection(datos.params.coleccion); //name of db collection

      let datosArgumentos = datos.params.argumentos;
      console.log("Argumentos: ", datosArgumentos);

      let objeto = datos.params.query;

      datosArgumentos.forEach((d: any) => {
        console.log("Entra a datos Argumentos: ", d);
        let index = datos.params.argumentos.findIndex((a: any) => a.param === d.param);
        let replace;
        // d.value = fechas[index].fecha;
        console.log("D Value: ", d.valor);
        switch (datos.params.argumentos[index].tipo) {
          case 'date':
            replace = parseDate(d.valor);
            break;
        }
        datos.params.argumentos[index]['dato'] = replace;
        console.log("Datata de cero: ", datos.params.argumentos[index]['dato']);
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

      let csv = datos.params.coleccion + '.csv';

      // const csvWriter = createCsvWriter({
      //   path: 'enviar/pacienteMpi.csv',
      //   header: [
      //     { id: '_id', title: 'IdPaciente' },
      //     { id: 'documento', title: 'DNI' },
      //     { id: 'nombre', title: 'Nombre' },
      //     { id: 'apellido', title: 'Apellido' },
      //     { id: 'sexo', title: 'Sexo' },
      //     { id: 'estado', title: 'Estado' },
      //     { id: 'fechaNacimiento', title: 'Fecha de Nacimiento' },
      //     { id: 'fechaEmpadronamiento', title: 'Fecha de Empadronamiento' },
      //     { id: 'provincia', title: 'Provincia' },
      //     { id: 'localidad', title: 'Localidad' },
      //     { id: 'calle', title: 'Calle' },
      //     { id: 'pais', title: 'Pais' }
      //   ]
      // });

      // csvWriter.writeRecords(pipe)       // returns a promise
      //   .then(() => {
      //     console.log('...Done');
      //   });

      let someObject = pipe[0] // JSON array
      let csvHeader = []
      for (let key in someObject) {
        csvHeader.push({ id: key, title: key });
      }

      const csvStringifier = createCsvStringifier({
        header: csvHeader
      });

      console.log(csvStringifier.getHeaderString());
      // => 'NAME,LANGUAGE\n'
      console.log(csvStringifier.stringifyRecords(pipe));
      capo = csvStringifier.stringifyRecords(pipe);
      console.log("Capooooooo: ", capo);

      //csvStringifier.stringifyRecords(pipe);
    });
    console.log("Resssssssssssss: ", res);
    return this.consultasRepository.create(capo);

  }

  @get('/csv', {
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
        let index = data[0].argumentos.findIndex((a: any) => a.param === d.param);
        let replace;
        // d.valor = fechas[index].fecha;
        console.log("D Value: ", d.valor);
        switch (data[0].argumentos[index].tipo) {
          case 'date':
            replace = parseDate(d.valor);
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
  async creates(
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
