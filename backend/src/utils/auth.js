import jwt from 'jsonwebtoken';

export function signAccess(payload){
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn:'2h' });
}
export function signRefresh(payload){
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn:'7d' });
}
export function authRequired(roles=[]){
  return (req,res,next)=>{
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if(!token) return res.status(401).json({ok:false, message:'No token'});
    try{
      const data = jwt.verify(token, process.env.JWT_SECRET);
      if(roles.length && !roles.includes(data.role)) {
        return res.status(403).json({ok:false, message:'Sin permiso'});
      }
      req.user = data;
      next();
    }catch(e){
      return res.status(401).json({ok:false, message:'Token inválido'});
    }
  }
}
