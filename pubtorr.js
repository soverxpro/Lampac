(function () {
    'use strict';

    const PLUGIN_NAME = 'lme_pubtorr'; // Уникальное имя плагина
    const SETTINGS_KEY = 'lme_url_two';

    // Функция для перевода текста
    function translate() {
        Lampa.Lang.add({
            lme_parser: {
                ru: 'Каталог парсеров',
                en: 'Parsers catalog',
                uk: 'Каталог парсерів',
                zh: '解析器目录'
            },
            lme_parser_description: {
                ru: 'Выберите парсер Jackett/Prowlarr из списка',
                en: 'Select a Jackett/Prowlarr parser from the list',
                uk: 'Виберіть парсер Jackett/Prowlarr зі списку',
                zh: '从列表中选择一个 Jackett/Prowlarr 解析器'
            },
            lme_pubtorr: {
                ru: 'LME PubTorr',
                en: 'LME PubTorr',
                uk: 'LME PubTorr',
                zh: 'LME PubTorr'
            },
            lme_pubtorr_description: {
                ru: 'Настройки LME PubTorr',
                en: 'LME PubTorr settings',
                uk: 'Налаштування LME PubTorr',
                zh: 'LME PubTorr 设置'
            },
            lme_pubtorr_firstrun: {
                ru: "Привет! Установил плагин LME PubTorr. Если Mods's, возможна ошибка в разделе парсеров (не влияет на работу).",
                en: "Hello! You have installed LME PubTorr. Mods's may cause an error in the parsers section (doesn't affect operation).",
                uk: "Привіт! Встановив плагін LME PubTorr. Якщо Mods's, можлива помилка у розділі парсерів (не впливає на роботу).",
                zh: "你好！ 你安装了LME PubTorr插件. 如果 Mods's, 解析器部分可能会出错 (不影响操作)."
            }
        });
    }

    // Информация о парсерах (Jackett/Prowlarr)
    const parsersInfo = [
        {
            base: 'BATjacRAD',
            name: 'BATjacRAD',
            settings: {
                url: 'batmen.my.to',
                key: '9',
                parser_torrent_type: 'jackett'
            }
        }, {
            base: 'batmen_my_to:9199',
            name: 'BATjackett',
            settings: {
                url: 'batmen.my.to:9199',
                key: '9',
                parser_torrent_type: 'jackett'
            }
        }, {
            base: '192_168_88_22_9117',
            name: 'My_local_Jackett.vpnhome',
            settings: {
                url: '192.168.88.22:9117',
                key: 'ysq90rqkky1qg38orl6uyrhy15icxfl6',
                parser_torrent_type: 'jackett'
            }
        }, {
            base: '192_168_88_22_9116',
            name: 'My_local_JacRed.vpnhome',
            settings: {
                url: '192.168.88.22:9116',
                key: '',
                parser_torrent_type: 'jackett'
            }
        }, {
            base: 'JacRed_PL',
            name: 'JacRed.PL',
            settings: {
                url: '185.36.143.11:9118',
                key: '1',
                parser_torrent_type: 'jackett'
            }
        },{
            base: 'JacRed_PL_vpn',
            name: 'JacRed.PL.vpn',
            settings: {
                url: '172.29.172.1:9118',
                key: '1',
                parser_torrent_type: 'jackett'
            }
        },	{
            base: 'jacred_viewbox_dev',
            name: 'Viewbox',
            settings: {
                url: 'jacred.viewbox.dev',
                key: 'viewbox',
                parser_torrent_type: 'jackett'
            }
        }, {
            base: 'jacred_xyz',
            name: 'Jacred.xyz',
            settings: {
                url: 'jacred.xyz',
                key: '',
                parser_torrent_type: 'jackett'
            }
        }, {
            base: 'lampa_app',
            name: 'lampa.add.vpnEU',
            settings: {
                url: 'lampa.add',
                key: '1',
                parser_torrent_type: 'jackett'
            }
        }
    ];

    const PROTO = location.protocol === "https:" ? 'https://' : 'http://';
    const cache = {}; // Объект для хранения кэша

    // Функция для проверки доступности парсера
    function checkAlive(type) {
        if (type === 'parser') {
            const requests = parsersInfo.map(parser => {
                const protocol = parser.base === "lme_jackett" || parser.base === "lme_prowlarr" ? "" : PROTO;
                const endPoint = parser.settings.parser_torrent_type === 'prowlarr' ? '/api/v1/health?apikey=' + parser.settings.key : `/api/v2.0/indexers/status:healthy/results?apikey=${parser.settings.key}`;
                const myLink = protocol + parser.settings.url + endPoint;

                // Находим элемент списка по имени парсера (Используем нативные методы DOM)
                const mySelector = Array.from(document.querySelectorAll('div.selectbox-item__title'))
                    .find(el => el.textContent.trim() === parser.name);

                // Проверяем наличие кеша
                if (cache[myLink]) {
                    console.log('Using cached response for', myLink, cache[myLink]);
                    const color = cache[myLink].color;
                    if(mySelector) mySelector.style.color = color;
                    return Promise.resolve();
                }

                return new Promise(resolve => {
                    if (!mySelector) return resolve(); // Если элемент не найден - пропускаем

                    fetch(myLink)
                        .then(response => {
                            let color;
                            if (response.ok) {
                                color = '#1aff00'; // Успех
                            } else if (response.status === 401) {
                                color = '#ff2e36'; // Ошибка авторизации
                            } else {
                                color = '#ff2e36'; // Другие ошибки
                            }

                            if(mySelector) mySelector.style.color = color;

                            cache[myLink] = { color }; // Кэшируем результат
                            resolve();
                        })
                        .catch(error => {
                            console.error(`Error checking ${parser.name}:`, error);
                            if(mySelector) mySelector.style.color = '#ff2e36';
                            resolve();
                        });
                });
            });

            return Promise.all(requests)
                .then(() => console.log('All parser checks completed'));
        }
    }

    // Функция для применения настроек парсера
    function applyParserSettings() {
        const selectedParserBase = Lampa.Storage.get(SETTINGS_KEY);
        const selectedParser = parsersInfo.find(parser => parser.base === selectedParserBase);

        if (selectedParser) {
            const settings = selectedParser.settings;
            Lampa.Storage.set(settings.parser_torrent_type === 'prowlarr' ? "prowlarr_url" : "jackett_url", settings.url);
            Lampa.Storage.set(settings.parser_torrent_type === 'prowlarr' ? "prowlarr_key" : "jackett_key", settings.key);
            Lampa.Storage.set("parser_torrent_type", settings.parser_torrent_type);
            console.log(`LME PubTorr: Applied settings for ${selectedParser.name}`);
        } else {
            console.warn("LME PubTorr: No parser selected or parser not found in parsersInfo");
        }
    }

    // Функция для создания настроек плагина
    function createSettings() {
        const values = parsersInfo.reduce((acc, parser) => {
            acc[parser.base] = parser.name;
            return acc;
        }, { no_parser: 'Не выбран' });

        Lampa.SettingsApi.add({
            id: PLUGIN_NAME,
            name: Lampa.Lang.translate('lme_pubtorr'),
            icon: 'cloud_download', // Выберите подходящую иконку
            description: Lampa.Lang.translate('lme_pubtorr_description'),
            settings: [
                {
                    id: SETTINGS_KEY,
                    name: Lampa.Lang.translate('lme_parser'),
                    type: 'select',
                    values: values,
                    default: 'no_parser',
                    description: Lampa.Lang.translate('lme_parser_description') + ' ' + parsersInfo.length,
                    onChange: () => {
                        applyParserSettings();
                        Lampa.Settings.update();
                    },
                    onRender: (item) => {
                        // Запускаем проверку доступности парсеров после рендеринга элемента настроек
                        checkAlive('parser');

                        // Подписываемся на событие hover:enter
                        item.addEventListener('hover:enter', () => {
                            Lampa.Settings.update();
                        });
                    }
                }
            ]
        });
    }

    // Функция для инициализации плагина
    function initializePlugin() {
        translate();
        createSettings();
        applyParserSettings(); // Применяем настройки при запуске плагина

        // Добавляем слушателя на событие открытия настроек
        Lampa.Controller.listener.follow('toggle', event => {
            if (event.name === 'settings') {
                checkAlive('parser');
            }
        });

        console.log('LME PubTorr: Plugin initialized');
    }

    // Проверяем, что Lampa готова
    Lampa.Listener.follow('app', event => {
        if (event.type === 'ready') {
            initializePlugin();
        }
    });

    // Выводим сообщение при первом запуске (опционально)
    if (!Lampa.Storage.get('lme_pubtorr_firstrun')) {
        Lampa.Noty.show({
            text: Lampa.Lang.translate('lme_pubtorr_firstrun'),
            timeout: 10000
        });
        Lampa.Storage.set('lme_pubtorr_firstrun', true);
    }

})();
