import modelAuth from "../models/login_model.js"

export const loginController = async (req,res) => {
    try {
        const credenciales = req.body
        //console.log(credenciales)
        const resultado = await modelAuth.Login(credenciales)
       
        if(resultado.existsUser){
            res.status(201).json(resultado)
        }
        else if(resultado.message === 'Invalid credentials!'){
            res.status(400).json({message:resultado.message})
        }
        else{
            res.status(404).json({message:'Not Found'})
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

export const postUserController = async (req,res)=>{
    try {  
        const credenciales = req.body
        const resultado = await modelAuth.createUser(credenciales)
        if(resultado.message=="User exist!"){
            return res.status(400).json({message:resultado.message})
        }
        res.status(201).json(resultado)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}


export const putMicroUserController = async (req, res) => {
  try {
    const credenciales = req.body;
    const resultado = await modelAuth.upsertMicroUser(credenciales);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const postMicroUserController = async (req, res) => {
  try {
    const credenciales = req.body;
    const resultado = await modelAuth.createMicroUser(credenciales);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const existUserController = async (req,res) => {
    try {
        const credenciales = req.body
        console.log("controller",credenciales)
        const resultado = await modelAuth.existUser(credenciales)
        console.log("controller",resultado)
        if(resultado.message == 'User exist!'){
            res.status(201).json(resultado)
        }
        else if (resultado.message == 'User new'){
            res.status(201).json(resultado)
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

export const getTelefonos = async (req,res) => {
    try{
        const {id}= req.params
        const resultado = await modelAuth.getTelefono(id)
        if(!resultado){
            return res.status(404).json({message: "Data not found"});
        }
        res.status(200).json(resultado);
    }catch (error){
        res.status(500).json({error: error.message});
    }
}


export const getTelefonosDistribuidor = async (req,res) => {
    try{
        const {id}= req.params
        const resultado = await modelAuth.getTelefonoDistribuidor(id)
        if(!resultado){
            return res.status(404).json({message: "Data not found"});
        }
        res.status(200).json(resultado);
    }catch (error){
        res.status(500).json({error: error.message});
    }
}

export const getInfoUsers = async (req,res) => {
    try{
        const {id}= req.params
        const resultado = await modelAuth.getInfoUser(id)
        if(!resultado){
            return res.status(404).json({message: "Data not found"});
        }
        res.status(200).json(resultado);
    }catch (error){
        res.status(500).json({error: error.message});
    }
}


export const actualizarUsuarioController = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = req.body
    const response = await modelAuth.actualizarUsuario(id, resultado);
    if (!response) {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const putTelefono = async (req,res) =>{//Add commentMore actions
    try{
        const {firebaseUID} = req.params
        const datos = req.body
        const resultado  = await modelAuth.updateTelefono(datos,firebaseUID)
        if(!resultado){
            return res.status(404).json({message:response.message})
        }
        return res.status(200).json(resultado)
    }
    catch(error){
        res.status(500).json({error:error.message})
    }
};

// nuevo
export const getFirebaseuid = async (req,res) => {
    try {
        const {firebaseUID} = req.params
        const response = await modelAuth.getFirebaseuid(firebaseUID)
        if(!response){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}
