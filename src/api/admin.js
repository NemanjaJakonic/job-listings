const express = require("express");
const router = express.Router();
const monk = require("monk");
const Joi = require("joi");
const verify = require('./verifyToken')

const {
    CloudinaryStorage
} = require('multer-storage-cloudinary');
const multer = require('multer');


const db = monk(process.env.MONGO_URI);
const jobs = db.get("jobs");
const users = db.get("users");

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // async code using `req` and `file`
        // ...
        // console.log(req.body.company_name);
       
        // const original_filename = file.originalname.split('.').slice(0, -1).join('.')
        return {        
          format: 'png',
        };
      },
    // params: {
    //     folder: 'logo',
    //     format: async (req, file) => 'png', // supports promises as well
    //     use_filename:true
    // },
});

const upload = multer({
    storage: storage
})


const technologies = require('../assets/technologies.json')

const schema = Joi.object({
    logo: Joi.string().trim().required(),
    company_name: Joi.string().trim().required(),
    job_name: Joi.string().trim().required(),
    level:Joi.string().trim().required(),
    role:Joi.string().trim().required(),
    job_description: Joi.string().trim().required(),
    working_hours: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    technologies: Joi.array().items(Joi.string().trim()).required(),
    date: Joi.date(),
    posted_by_name: Joi.string().trim(),
    posted_by_id: Joi.string().trim(),
});

// READ ALL
router.get("/", verify, async (req, res, next) => {
    try {
        const user = await users.findOne({
            _id: req.user._id
        })
        const items = await jobs.find({
            posted_by_id: req.user._id
        }, {
            sort: {
                date: -1
            }
        });
        let time = items.map(items => Math.floor(Math.abs(new Date() - new Date(items.date)) / (1000 * 60 * 60 * 24)))
        res.render("admin/admin", {
            items,
            time,
            user,
            success_job: req.flash('success_job'),
            success_edit: req.flash('success_edit')

        });
    } catch (error) {
        next(error);
    }
});

router.get("/create", verify, async (req, res, next) => {
    try {
        const user = await users.findOne({
            _id: req.user._id
        })
        res.render("admin/create", {
            technologies,
            error: req.flash('error'),
            user
        });
    } catch (error) {
        next(error);
    }
});

// CREATE ONE
router.post("/", upload.single("image"), verify, async (req, res, next) => {
    try {
        const user = await users.findOne({
            _id: req.user._id
        })
        const result = await cloudinary.uploader.upload(req.file.path)

        const value = await schema.validateAsync({
            logo: result.secure_url,
            company_name: req.body.company_name,
            job_name: req.body.job_name,
            level:req.body.level,
            role:req.body.role,
            job_description: req.body.job_description,
            working_hours: req.body.working_hours,
            country: req.body.country,
            technologies: req.body.technologies,
            date: Date.now(),
            posted_by_name: user.firstName,
            posted_by_id: req.user._id
        });

        const inserted = await jobs.insert(value);
        req.flash('success_job', 'Job post created successfully!')
        res.redirect("/admin");
    } catch (error) {
        req.flash('error', error.message)
        res.redirect('/admin/create')
        next()
    }
});

// UPDATE ONE
router.get("/edit/:id", verify, async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const item = await jobs.findOne({
            _id: id,
        });
        const user = await users.findOne({
            _id: req.user._id
        })
        if (!item) return next();
        res.render("admin/edit", {
            item,
            technologies,
            error: req.flash('error'),
            user,
        });
        // return res.json(item);
    } catch (error) {
        next(error);
    }
});

// UPDATE ONE
router.put("/edit/:id", upload.single("image"), async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
       
        if (req.file === undefined){  
            logo = req.body.logo;              
        }else{
            const result = await cloudinary.uploader.upload(req.file.path)
            logo = result.secure_url           
        }
        const value = await schema.validateAsync({
            logo: logo,
            company_name: req.body.company_name,
            job_name: req.body.job_name,
            level:req.body.level,
            role:req.body.role,
            job_description: req.body.job_description,
            working_hours: req.body.working_hours,
            country: req.body.country,
            technologies: req.body.technologies,
        });
        const updated = await jobs.update({
            _id: id,
        }, {
            $set: value,
        });
       
        req.flash('success_edit', 'Job post edited successfully!')
        res.redirect('/admin')
        
    } catch (error) {
        req.flash('error', error.message)
        res.redirect('/admin/edit/' + req.params.id)
        next();
    }
});

// DELETE ONE
router.delete("/delete/:id", async (req, res, next) => {
    const {
        id
    } = req.params;
    try {
        const deleted = await jobs.remove({
            _id: id,
        });
        res.redirect("/admin");
    } catch (error) {
        next(error);
    }
});


module.exports = router;