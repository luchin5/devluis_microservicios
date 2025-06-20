import pgPromise from 'pg-promise';

const pgp = pgPromise();

const connectionStr = "postgresql://aguasol_xar2_user:WCJ9WKpeqQdIirMX1z85mRvDsB27IhX5@dpg-cqkps2ogph6c738j8r90-a.oregon-postgres.render.com/dev_micro_ubicacion";
//const connectionStr = "postgresql://aguasol:TntaHgQf9msnfmHXdrQWEXHEt1hut1MC@dpg-cml86oacn0vc739oj51g-a.oregon-postgres.render.com/aguasol_ui5l";
//const connectionStr = "postgres://aguasol:TntaHgQf9msnfmHXdrQWEXHEt1hut1MC@dpg-cml86oacn0vc739oj51g-a/aguasol_ui5l";
//const connectionStr = "postgresql://postgres:localhost@5432/aguasol_xar2";

export const db_pool = pgp({
    connectionString: connectionStr,
    ssl: {
      rejectUnauthorized: false, // Puedes ajustar esto según tus necesidades de seguridad
    },
  });

try{
    db_pool.connect()
    .then(obj=>{
        console.log("AGUA SOL DB CONNECTED !");
        obj.done();
    })
    .catch(err=>{
        console.log("NO CONNECTED AGUA SOL:",err);
    })
    //
}
catch(err){
    console.log(`ERROR CONFIGURATION: ${err}`);
}
