const express = require('express');
const app = express();
const port = 3000;

const { faker } = require('@faker-js/faker/locale/ru');
const { v4: uuidv4 } = require('uuid');


app.listen(port, () => {
    console.log(`http://localhost:${port}`);
})

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const hbs = require('hbs');

app.set('views', 'views')
app.set('view engine', 'hbs')

let data = [];

for (let i = 0; i < 15; i++) {
    data.push({
        id: uuidv4(),
        image: faker.image.urlLoremFlickr({ category: 'cat' }),
        name: faker.person.firstName(),
        sex: faker.person.sexType(),
        breed: faker.animal.cat(),
        age: faker.number.int({min: 0, max: 20}),
        description: faker.lorem.sentence(),
        isHome: faker.datatype.boolean(),
        isReq: false
    })
}

app.get('/', (req, res) => {
    res.render('index', {
        data: data,
    });
})

app.get(`/filter`, (req, res) => {
    const isHouse = Boolean(Number(req.query.isHouse));
    res.render('index', {
        data: data.filter((e) => {
            return e.isHome === isHouse;
        }),
    })
})

app.get(`/reqAdminAdd`, (req, res) => {
    const reqIndex = req.query.reqIndex;
    data[reqIndex].isReq = true;

    res.render('index', {
        data: data
    })
})

app.get('/admin', (req, res) => {
    res.render('admin', {
        data: data,
    })
})

app.post('/filterAdmin', (req, res) => {
    const { name, sex, breed, age } = req.body;

    let filteredCats = data.filter(cat => {
        return (!name || cat.name.toLowerCase().includes(name.toLowerCase())) &&
            (!sex || cat.sex === sex) &&
            (!breed || cat.breed.toLowerCase().includes(breed.toLowerCase())) &&
            (!age || cat.age == age);
    });

    res.render('admin', { data: filteredCats });
});

app.get('/confirm', (req, res) => {
    const reqIndex = req.query.reqIndex;
    data[reqIndex].isReq = false;
    data[reqIndex].isHome = true;

    res.render('admin', {
        data: data,
    })
})

app.get(`/add-cat`, (req, res) => {
    res.render('add-cat')
})

app.post(`/addCatRequest`, (req, res) => {
    const {image, name, sex, breed, age, description} = req.body;

    data.push({
        id: uuidv4(),
        image: image,
        name: name,
        sex: sex,
        breed: breed,
        age: age,
        description: description,
        isHome: false,
        isReq: false
    })

    res.redirect(`/admin`)
})

app.get(`/cat`, (req, res) => {
    const cat = Number(req.query.catID);

    res.render('cat', {
        data: data[cat],
        dataID: cat,
    })
})