//import S from 'fluent-json-schema'
export const autoPrefix = process.env.NODE_ENV === 'production'? '/search/layers' : '/searchinfo/layers'

export default async function layersearch (fastify, opts, next) {
  const { db } = fastify.mongo.mongo1;
  const layerprops = db.collection('layerprops');
//can refer: https://github.com/Cristiandi/demo-fastify/blob/master/src/routes/api/persons/schemas.js
//see: https://developer.ibm.com/tutorials/learn-nodejs-mongodb/
  const selLayerSchema = {
              //_id: { type: 'string' },
              value: { type: 'string' },
              label: { type: 'string' },
              type: { type: 'string' },
              format: { type: 'string' },
              metagroup: { type: 'string' }
            };
    fastify.get('/:name', {
      schema: {
        tags: ['layers'],
        response: {
          200: /*S.object()
            .prop('value', S.string())
            .prop('label', S.string())
            .prop('type',  S.string())
            .prop('format', S.string())
            .prop('metagroup', S.string()) */
            {
              type: 'array',
              items: {
                type: 'object',
                //required: ['value', 'label', 'type', 'format'],
                properties: selLayerSchema
            }
          }
        }
      }
    },
    (req, reply) => {
      layerprops.find({$or:[
        {value: {$regex: req.params.name, $options: "ix"} },
        {label: {$regex: req.params.name, $options: "ix"} },
        {metagroup: {$regex: req.params.name, $options: "ix"} }
        ]}//,
        //onFind
      ).toArray(async (err, layer) => {
      //async function onFind (err, layer) {
        if (err) {
          req.log.info("Error when searching in Mongo: ", err);
          await reply.send({});
        } else {
          //console.log("layers found in Mongo: ", layer);
          await reply.send(layer);
        }
      })
    })
  next()
}
