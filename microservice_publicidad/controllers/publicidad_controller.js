import modelPublicidad from "../models/publicidad_model.js"

export const getPublicidadController  = async(req, res)=>{
    try{
        const resultado = await modelPublicidad.getPublicidad()
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      };

export const getPublicidadesBanners = async(req, res) =>{
  try{
    const resultado = await modelPublicidad.getPublicidadBanners()
    if(!resultado) {
      return res.status(404).json({message:"Data not Found"});
    }
    res.status(200).json(resultado);
  }catch(error){
    res.status(500).json({ error: error.message });
  }
};