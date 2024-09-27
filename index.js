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
const {da} = require("@faker-js/faker");

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

// Поиск кота по id
const findCatById = (id) => {
    return data.find(cat => cat.id === id);
}

// Главная страница
app.get('/', (req, res) => {
    res.render('index', {
        data: data,
        title: "Поиск дома для котиков"
    });
})

// Фильтрация на главной странице
app.get(`/filter`, (req, res) => {
    const house = Number(req.query.isHouse);
    if (house === 2) {
        res.render('index', {
            data: data,
            title: "Поиск дома для котиков"
        });
    }
    else {
        const isHouse = Boolean(house)
        res.render('index', {
            data: data.filter((e) => {
                return e.isHome === isHouse;
            }),
            title: "Поиск дома для котиков"
        })
    }
})

// Обработка запроса "Хочу забрать"
app.get(`/reqAdminAdd`, (req, res) => {
    const reqIndex = req.query.reqIndex;
    const cat = findCatById(reqIndex)
    cat.isReq = true;

    res.redirect(`/`);
})

// Админ панель
app.get('/admin', (req, res) => {
    res.render('admin', {
        data: data,
        title: "Админ панель"
    })
})

// Фильтрация в админ панели
app.post('/filterAdmin', (req, res) => {
    const { name, sex, breed, age } = req.body;

    let filteredCats = data.filter(cat => {
        return (!name || cat.name.toLowerCase().includes(name.toLowerCase())) &&
            (!sex || cat.sex === sex) &&
            (!breed || cat.breed.toLowerCase().includes(breed.toLowerCase())) &&
            (!age || cat.age == age);
    });

    res.render('admin', {
        data: filteredCats,
        title: "Админ панель"
    });
});

// Подтверждение запроса в админ панели
app.get('/confirm', (req, res) => {
    const reqIndex = req.query.reqIndex;
    const cat = findCatById(reqIndex)
    cat.isReq = false;
    cat.isHome = true;

    res.redirect(`/admin`);
})

// Форма добавления кота
app.get(`/add-cat`, (req, res) => {
    res.render('add-cat', {
        title: "Добавить кота"
    })
})

// Обработка запроса на добавление кота
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

// Подробная информация о коте
app.get(`/cat`, (req, res) => {
    const catID = req.query.catID;

    const cat = findCatById(catID);
    res.render('cat', {
        data: cat,
        title: `Информация о ${cat.sex === "male"? "коте": "кошке"}`
    })

})

// Удаление кота
app.get('/delete', (req, res) => {
    const reqIndex = req.query.reqIndex;
    const cat = findCatById(reqIndex)

    data.splice(data.indexOf(cat), 1);
    res.redirect(`/admin`);
})