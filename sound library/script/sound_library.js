const db = new Dexie('CatsDB'); // Создаем базу данных

db.version(1).stores({          // Говорим что будет в ней храниться
    cats: '++id, name, png_path, sound_path' 
});

console.log(`БД готова!`);

async function initDB() {
    await db.cats.clear();

    await db.cats.bulkAdd([                 // Множественное заполнение БД котами
            { name: 'Cat 1',  png_path: 'cat1.jpg', sound_path: 'sounds/cat1', },
            { name: 'Cat 2',  png_path: 'cat2.jpg', sound_path: 'sounds/cat2' }
        ]);

    const cnt = await db.cats.count();      // Получаем текущее количество котов из БД
    console.log(`Сейчас котов: ${cnt}`);
    console.log(`База заполнена!`);
}

async function renderCats() {
    const cats = await db.cats.toArray();                           // Получаем всех котов из БД

    const container = document.querySelector('.container');         // Находим контейнер, в котором будут ячейки с котами
    container.innerHTML = '';                                       // Очищаем этот контейнер

    cats.forEach(cat => {                                           // Для каждого кота делаем ячейку html
        const link = document.createElement('a');
        link.href = `cat.html?id=${cat.id}`;
        link.className = 'card';                                    // Создаем a с классом card

        const img = document.createElement('img');                 // Так же с img
        img.src = cat.png_path;

        img.onerror = function() {                                  // Если не нашли картинку кота, то выводим заглушку
            this.src = 'cat.jpg';
            this.alt = 'Кота нет:(';
            console.log(`Картинка для ${cat.name} не найдена: ${cat.png_path}`)
        };

        const p = document.createElement('p');                      
        p.textContent = cat.name;                                   // Создаем p и наполняем его текстом имени кота

        link.appendChild(img); link.appendChild(p);                 // Добавляем всё в ячейку в html

        container.appendChild(link);                                // Добавляем карточку в контейнер
    }); console.log(`Ячейки добавлены!`);
}

async function start() {
    console.log(`Запуск...`);

    await initDB();
    await renderCats();

    console.log(`Успешный запуск!`);
}

start();