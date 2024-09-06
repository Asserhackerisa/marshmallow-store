const { config } = require('dotenv');
const addproduct = require('../schemas/products-schema');
const checkoutschema=require('../schemas/checkoutschema');
const multer  = require('multer')
const upload = multer({ dest: 'images/' })
require('dotenv').config();

exports.getSignInPage = (req, res) => {
    res.render('admin-login', {
        admin: true,
        errorMessage:req.flash('adminError')
    });
}


exports.postSignInPage = async(req,res) => {
    //checking pass
    if (req.body.email == process.env.adminemail && req.body.password == process.env.adminpassword) {
        req.session.isAdmin=true;
        req.session.save(()=>{
            res.redirect('/admin/home');
        })
    } else {
        req.flash('adminError','Invalide username or password');
        res.status(400).redirect('/admin/signin');
    }
}


exports.getAdminHomePage = async (req, res) => {

    let products = await addproduct.find()
    res.render('adminHome', {
        products: products
    })
}

exports.getAdminAddPage = (req, res) => {
    res.render('addproduct');
}



exports.postaddProduct = (req, res) => {
   
    // console.log('Request body:', req.body);
    // console.log('Uploaded file:', req.file);
    // console.log('CSRF Token Received:', req.body._csrf);
    const { name, price } = req.body;
  
    
    if (!name) {
      return res.status(400).json("Please enter a name for the product.");
    }
  
    if (!price) {
      return res.status(400).json("Please enter a price for the product.");
    }
  
    
    const imgUrl = req.file ? req.file.path : 'images/error.jpg'; 
  
   
    const product = new addproduct({
      name,
      price,
      imgUrl, 
    });
  
    
    product.save()
      .then(() => {
        res.redirect('/admin/home'); 
      })
      
  };
  

exports.getAdminEditPage = async (req, res) => {
    const prodID = req.params.ID;
    const prod = await addproduct.findById(prodID);
    // console.log(prod);

    res.render('editpage', {
        product: prod
    });

}

exports.posteditProduct = async (req, res) => {
    console.log(req.body)
    const imgproduct = await addproduct.findById(req.params.ID);
    const product = await addproduct.findOneAndUpdate({
        _id: req.params.ID
    }, {
        name: req.body.name,
        price: req.body.price,
        imgUrl: req.file ? req.file.path : imgproduct.imgUrl
    }, {
        new: true
    })
    

    product.save().then(()=>{

        res.redirect('/admin/home');
    })
}

exports.postdeleteproduct = async (req, res) => {
    const product = await addproduct.findById(req.params.ID);
    if (!product) {
        return res.status(404).json("no product found");
    }
    await addproduct.deleteOne({
        _id: req.params.ID
    });
    
    res.redirect('/admin/home');
}

exports.getAdminOrders=async(req,res)=>{

    const orders=await checkoutschema.find();
    // console.log(orders);
    res.render('adminorders',{
        orders:orders
    });
}

exports.getOrderDetails=async(req,res)=>{
    //console.log("asser");
    const orderID=req.params.ID;
    const orders=await checkoutschema.findById(orderID);

    const prodIds = [];
    const qnties=[];
    for (let item of orders.cart) 
    {
        prodIds.push(item.prodId);
        qnties.push(item.qnty);
    }
    //console.log(prodIds);

    const products = [];
    for(let i=0;i<prodIds.length;i++)
    {
        const product=await addproduct.findById(prodIds[i]);
        products.push(product)
        products.push(qnties[i]);
    }

    //console.log(products);
    //console.log('gellow');
    res.render('details-orders',{
        products:products,
        isAdmin:true
    });
}

exports.postUpdateStatus=async(req,res)=>{
    const orderID=req.params.ID;
    await checkoutschema.findOneAndUpdate({_id:orderID},{
        status:req.body.status
    },{
        new:true
    })
    
    res.redirect('/admin/orders');
}

exports.postAdminLogout=(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/signin');
    })
}