exports.isUser =function(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
    }
}

exports.isAdmin =function(req,res,next){
    if(req.isAuthenticated() && req.user && req.user.admin == 1){
        next();
    }else{
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
    }
}