const dotenv = require("dotenv")
dotenv.config()
const Joi = require('joi');
const { useAsync, utils, errorHandle, } = require('../core');
const { ModelTalent, ModelUser } = require("../models");


exports.createTalent = useAsync(async (req, res) => {

    try {
        const uid = req.userId
        //create data if all data available
        const schema = Joi.object({
            name: Joi.string().required(),
            tiktok: Joi.string().required(),
            facebook: Joi.string().required(),
            age: Joi.number().required(),
            youtube: Joi.string().optional(),
            twitter: Joi.string().optional(),
            snapchat: Joi.string().optional()
        })

        const { name, tiktok, facebook, age, youtube, twitter, snapchat } = req.body;

        //validate user
        const value = await schema.validateAsync(req.body);
        value.uid = uid
        const talent = await new ModelTalent(value)

        await talent.save().then(async () => {
            return res.json(utils.JParser('Talent created successfully', !!talent, talent));
        })

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.getSingleTalent = useAsync(async (req, res) => {

    try {

        const tid = req.params.id
        const option = {
            where: { tid },
            include: [ // Include the related user data
            {
                model: ModelUser,
                as: 'user',
                attributes: ['uid', 'name'],
            },
        ],
        }

        const talent = await ModelTalent.findOne(option);

        if (talent) {
            return res.json(utils.JParser('Talent fetch successfully', !!talent, talent));
        } else {
            return res.status(402).json(utils.JParser('Talent not found', false, []));
        }

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})



exports.editTalent = useAsync(async (req, res) => {

    try {

        const schema = Joi.object({
            id: Joi.number().required(),
            name: Joi.string().min(3).max(150).optional(),
            title: Joi.string().min(3).max(150).optional(),
            description: Joi.string().optional()
        })

        const { name, title, description, id } = req.body;

        //validate user
        const value = await schema.validateAsync(req.body);

        const vid = value.id
        const option = {
            where: { vid }
        }

        if (!id) return res.status(402).json(utils.JParser('Talent not found', false, []));

        await ModelTalent.update(value, option).then(async () => {
            const talent = await ModelTalent.findOne(option);
            return res.json(utils.JParser('Talent Update Successfully', !!talent, talent));
        })

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.allTalent = useAsync(async (req, res) => {

    try {
        const talent = await ModelTalent.findAll({
            order: [
                ['createdAt', 'DESC'],
            ],
            include: [ // Include the related user data
                {
                    model: ModelUser,
                    as: 'user',
                    attributes: ['uid', 'name'],
                },
            ],
        });
        if (!talent) return res.status(402).json(utils.JParser('Talent not found', false, []));
        return res.json(utils.JParser('All talent fetch successfully', !!talent, talent));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.deleteTalent = useAsync(async (req, res) => {
    try {
        const tid = req.params.id
        if (!tid) return res.status(402).json(utils.JParser('provide the patient id', false, []));
        const option = {
            where: { tid }
        }
        const talent = await ModelTalent.destroy(option)
        return res.json(utils.JParser('Patient deleted successfully', !!talent, []));

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }

});
