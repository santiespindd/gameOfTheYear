import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';


const serviceAccount = require("./serviceAccountKey.json");

//FIREBASE DE MANERA LOCAL 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firestore-grafica-e0506.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript


//CLOUD FUNCTIONS
export const helloWorld = functions.https.onRequest((request, response) => {
    response.json({
        mensaje: 'Hola mundo desde firebase Funciones!!!'
    })
});

export const getGOTY = functions.https.onRequest(async (request, response) => {
    // const nombre= request.query.nombre;
    const gotyRef = db.collection('goty');
    const docsSanp = await gotyRef.get();
    const juegos = docsSanp.docs.map(doc => doc.data());
    response.json(juegos);
});

//EXPRESS 
const app = express();
app.use(cors({ origin: true }));

app.get('/goty', async (req, res) => {

    const gotyRef = db.collection('goty');
    const docsSanp = await gotyRef.get();
    const juegos = docsSanp.docs.map(doc => doc.data());
    res.json(juegos);

}
);
app.post('/goty/:id', async (req, res) => {
  const id = req.params.id;
  const gameRef= db.collection('goty').doc(id);
  const gameSnap= await gameRef.get();
    
  if(!gameSnap.exists){
    res.status(404).json({
        ok: false,
        mensaje: 'No existe un juego con ese ID ' + id
    });
  }
  else{
      const antes = gameSnap.data() || {votos : 0};
      await gameRef.update(
          {
            votos: antes.votos + 1
          }
      );
      res.json({
        ok: true,
        mensaje: `Gracias por tu voto  a ${ antes.name }`

      });
  }
});

export const api = functions.https.onRequest(app);