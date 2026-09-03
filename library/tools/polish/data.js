/* ===================== ALPHABET & SOUNDS ===================== */
const ALPHABET = [
  {char:"a",sound:"ah, as in father",row:"vowels"},
  {char:"e",sound:"eh, as in bed",row:"vowels"},
  {char:"i",sound:"ee, as in see",row:"vowels"},
  {char:"o",sound:"oh, as in more",row:"vowels"},
  {char:"u",sound:"oo, as in food",row:"vowels"},
  {char:"y",sound:"short ih, as in bit",row:"vowels"},
  {char:"ó",sound:"oo, same as u",row:"vowels"},
  {char:"ą",sound:"nasal on",row:"nasal vowels"},
  {char:"ę",sound:"nasal en",row:"nasal vowels"},
  {char:"c",sound:"ts, as in cats",row:"tricky consonants"},
  {char:"h",sound:"h, like Scottish loch",row:"tricky consonants"},
  {char:"j",sound:"y, as in yes",row:"tricky consonants"},
  {char:"ł",sound:"w, as in water",row:"tricky consonants"},
  {char:"w",sound:"v, as in victory",row:"tricky consonants"},
  {char:"g",sound:"hard g, as in go",row:"tricky consonants"},
  {char:"ć",sound:"soft ch",row:"soft consonants"},
  {char:"ń",sound:"soft ny, as in canyon",row:"soft consonants"},
  {char:"ś",sound:"soft sh",row:"soft consonants"},
  {char:"ź",sound:"soft zh",row:"soft consonants"},
  {char:"dź",sound:"soft j, as in jeans",row:"soft consonants"},
  {char:"cz",sound:"hard ch, as in church",row:"digraphs"},
  {char:"sz",sound:"hard sh, as in shop",row:"digraphs"},
  {char:"rz",sound:"zh, as in pleasure",row:"digraphs"},
  {char:"ż",sound:"zh, same as rz",row:"digraphs"},
  {char:"ch",sound:"h, same as h",row:"digraphs"},
  {char:"dz",sound:"ds, as in lads",row:"digraphs"},
  {char:"dż",sound:"hard j, as in jungle",row:"digraphs"},
  {char:"b",sound:"b, as in English",row:"regular consonants"},
  {char:"d",sound:"d, as in English",row:"regular consonants"},
  {char:"f",sound:"f, as in English",row:"regular consonants"},
  {char:"k",sound:"k, as in English",row:"regular consonants"},
  {char:"l",sound:"l, as in English",row:"regular consonants"},
  {char:"m",sound:"m, as in English",row:"regular consonants"},
  {char:"n",sound:"n, as in English",row:"regular consonants"},
  {char:"p",sound:"p, as in English",row:"regular consonants"},
  {char:"r",sound:"rolled r",row:"regular consonants"},
  {char:"s",sound:"s, as in English",row:"regular consonants"},
  {char:"t",sound:"t, as in English",row:"regular consonants"},
  {char:"z",sound:"z, as in English",row:"regular consonants"}
];

/* ===================== VOCAB SETS ===================== */
const VOCAB_SETS = [
{id:"numbers",title:"Numbers 0-100",words:[
{pl:"zero",pron:"ZEH-roh",en:"zero",example_pl:"Mam zero pytań.",example_en:"I have zero questions."},
{pl:"jeden",pron:"YEH-den",en:"one",example_pl:"Mam jeden dom.",example_en:"I have one house."},
{pl:"dwa",pron:"dvah",en:"two",example_pl:"Mam dwa psy.",example_en:"I have two dogs."},
{pl:"trzy",pron:"tshih",en:"three",example_pl:"Czekam trzy minuty.",example_en:"I've been waiting three minutes."},
{pl:"cztery",pron:"CHTEH-rih",en:"four",example_pl:"Mam cztery książki.",example_en:"I have four books."},
{pl:"pięć",pron:"pyench",en:"five",example_pl:"Mam pięć złotych.",example_en:"I have five złoty."},
{pl:"sześć",pron:"sheshch",en:"six",example_pl:"Wstaję o szóstej.",example_en:"I get up at six."},
{pl:"siedem",pron:"SHYEH-dem",en:"seven",example_pl:"Mam siedem lat kota.",example_en:"My cat is seven years old."},
{pl:"osiem",pron:"OH-shyem",en:"eight",example_pl:"Pracuję osiem godzin.",example_en:"I work eight hours."},
{pl:"dziewięć",pron:"JEH-vyench",en:"nine",example_pl:"Jest dziewięć osób.",example_en:"There are nine people."},
{pl:"dziesięć",pron:"JEH-shench",en:"ten",example_pl:"Poczekaj dziesięć minut.",example_en:"Wait ten minutes."},
{pl:"dwadzieścia",pron:"dvah-JESH-cha",en:"twenty",example_pl:"Mam dwadzieścia lat.",example_en:"I am twenty years old."},
{pl:"trzydzieści",pron:"tshih-JESH-chee",en:"thirty",example_pl:"To kosztuje trzydzieści złotych.",example_en:"That costs thirty złoty."},
{pl:"pięćdziesiąt",pron:"pyench-JEH-shont",en:"fifty",example_pl:"Mam pięćdziesiąt złotych.",example_en:"I have fifty złoty."},
{pl:"sto",pron:"stoh",en:"one hundred",example_pl:"To kosztuje sto złotych.",example_en:"That costs one hundred złoty."}
]},
{id:"greetings",title:"Greetings & Everyday Phrases",words:[
{pl:"cześć",pron:"cheshch",en:"hi / bye (informal)",example_pl:"Cześć, jak się masz?",example_en:"Hi, how are you?"},
{pl:"dzień dobry",pron:"jen DOH-bri",en:"good day (formal)",example_pl:"Dzień dobry, panie doktorze.",example_en:"Good day, doctor."},
{pl:"dobry wieczór",pron:"DOH-bri VYE-choor",en:"good evening",example_pl:"Dobry wieczór wszystkim.",example_en:"Good evening everyone."},
{pl:"do widzenia",pron:"doh veed-ZEN-ya",en:"goodbye (formal)",example_pl:"Do widzenia, do jutra.",example_en:"Goodbye, see you tomorrow."},
{pl:"proszę",pron:"PROH-sheh",en:"please / here you go",example_pl:"Proszę, to dla ciebie.",example_en:"Here you go, this is for you."},
{pl:"dziękuję",pron:"jen-KOO-yeh",en:"thank you",example_pl:"Dziękuję bardzo za pomoc.",example_en:"Thank you very much for the help."},
{pl:"przepraszam",pron:"psheh-PRAH-sham",en:"excuse me / sorry",example_pl:"Przepraszam za spóźnienie.",example_en:"Sorry for being late."},
{pl:"tak",pron:"tahk",en:"yes",example_pl:"Tak, zgadzam się.",example_en:"Yes, I agree."},
{pl:"nie",pron:"nyeh",en:"no",example_pl:"Nie, dziękuję.",example_en:"No, thank you."},
{pl:"miło mi",pron:"MEE-woh mee",en:"nice to meet you",example_pl:"Miło mi cię poznać.",example_en:"Nice to meet you."},
{pl:"na zdrowie",pron:"nah ZDROH-vyeh",en:"cheers / bless you",example_pl:"Na zdrowie! Wypijmy za nas.",example_en:"Cheers! Let's drink to us."},
{pl:"wszystko w porządku",pron:"FSHIST-koh v poh-RZHOND-koo",en:"everything's fine",example_pl:"Nie martw się, wszystko w porządku.",example_en:"Don't worry, everything's fine."}
]},
{id:"family",title:"Family",words:[
{pl:"matka",pron:"MAHT-kah",en:"mother",example_pl:"Moja matka mieszka w Krakowie.",example_en:"My mother lives in Kraków."},
{pl:"ojciec",pron:"OY-chets",en:"father",example_pl:"Mój ojciec jest lekarzem.",example_en:"My father is a doctor."},
{pl:"siostra",pron:"SHYOH-strah",en:"sister",example_pl:"Mam jedną siostrę.",example_en:"I have one sister."},
{pl:"brat",pron:"braht",en:"brother",example_pl:"Mój brat gra w piłkę.",example_en:"My brother plays football."},
{pl:"żona",pron:"ZHOH-nah",en:"wife",example_pl:"Moja żona pracuje w banku.",example_en:"My wife works at a bank."},
{pl:"mąż",pron:"monsh",en:"husband",example_pl:"Jej mąż jest miły.",example_en:"Her husband is nice."},
{pl:"syn",pron:"sihn",en:"son",example_pl:"Mój syn ma pięć lat.",example_en:"My son is five years old."},
{pl:"córka",pron:"TSOOR-kah",en:"daughter",example_pl:"Moja córka lubi czytać.",example_en:"My daughter likes to read."},
{pl:"babcia",pron:"BAHB-chah",en:"grandma",example_pl:"Babcia piecze ciasto.",example_en:"Grandma is baking a cake."},
{pl:"dziadek",pron:"JAH-dek",en:"grandpa",example_pl:"Dziadek opowiada historie.",example_en:"Grandpa tells stories."},
{pl:"rodzina",pron:"roh-JEE-nah",en:"family",example_pl:"Moja rodzina jest duża.",example_en:"My family is big."},
{pl:"przyjaciel",pron:"pshih-YAH-chel",en:"friend (male)",example_pl:"To jest mój przyjaciel.",example_en:"This is my friend."}
]},
{id:"time",title:"Time & Days of the Week",words:[
{pl:"poniedziałek",pron:"poh-nyeh-JAH-wek",en:"Monday",example_pl:"W poniedziałek zaczynam pracę.",example_en:"I start work on Monday."},
{pl:"wtorek",pron:"VTOH-rek",en:"Tuesday",example_pl:"Spotkajmy się we wtorek.",example_en:"Let's meet on Tuesday."},
{pl:"środa",pron:"SHROH-dah",en:"Wednesday",example_pl:"W środę mam egzamin.",example_en:"I have an exam on Wednesday."},
{pl:"czwartek",pron:"CHFAHR-tek",en:"Thursday",example_pl:"Czwartek jest moim ulubionym dniem.",example_en:"Thursday is my favorite day."},
{pl:"piątek",pron:"PYON-tek",en:"Friday",example_pl:"Lubię piątki.",example_en:"I like Fridays."},
{pl:"sobota",pron:"soh-BOH-tah",en:"Saturday",example_pl:"W sobotę odpoczywam.",example_en:"I rest on Saturday."},
{pl:"niedziela",pron:"nyeh-JEH-lah",en:"Sunday",example_pl:"Niedziela jest dniem wolnym.",example_en:"Sunday is a day off."},
{pl:"dziś",pron:"jeesh",en:"today",example_pl:"Dziś jest ciepło.",example_en:"Today it's warm."},
{pl:"jutro",pron:"YOO-troh",en:"tomorrow",example_pl:"Jutro jadę do Warszawy.",example_en:"Tomorrow I'm going to Warsaw."},
{pl:"wczoraj",pron:"FCHOH-rai",en:"yesterday",example_pl:"Wczoraj padał deszcz.",example_en:"Yesterday it rained."},
{pl:"która godzina",pron:"KTOO-rah goh-JEE-nah",en:"what time is it",example_pl:"Przepraszam, która godzina?",example_en:"Excuse me, what time is it?"},
{pl:"teraz",pron:"TEH-rahz",en:"now",example_pl:"Muszę iść teraz.",example_en:"I have to go now."}
]},
{id:"food",title:"Food, Drink & Restaurants",words:[
{pl:"chleb",pron:"khleb",en:"bread",example_pl:"Kupiłem świeży chleb.",example_en:"I bought fresh bread."},
{pl:"woda",pron:"VOH-dah",en:"water",example_pl:"Poproszę szklankę wody.",example_en:"A glass of water, please."},
{pl:"herbata",pron:"her-BAH-tah",en:"tea",example_pl:"Piję herbatę rano.",example_en:"I drink tea in the morning."},
{pl:"kawa",pron:"KAH-vah",en:"coffee",example_pl:"Lubię czarną kawę.",example_en:"I like black coffee."},
{pl:"mięso",pron:"MYEN-soh",en:"meat",example_pl:"Nie jem mięsa.",example_en:"I don't eat meat."},
{pl:"warzywa",pron:"vah-ZHIH-vah",en:"vegetables",example_pl:"Jem dużo warzyw.",example_en:"I eat a lot of vegetables."},
{pl:"owoc",pron:"OH-vots",en:"fruit",example_pl:"To jest mój ulubiony owoc.",example_en:"This is my favorite fruit."},
{pl:"smaczne",pron:"SMAHCH-neh",en:"tasty",example_pl:"To jedzenie jest smaczne.",example_en:"This food is tasty."},
{pl:"rachunek",pron:"rah-KHOO-nek",en:"the bill",example_pl:"Rachunek, proszę.",example_en:"The bill, please."},
{pl:"smacznego",pron:"smach-NEH-goh",en:"enjoy your meal",example_pl:"Smacznego! Miłego posiłku.",example_en:"Enjoy your meal!"},
{pl:"śniadanie",pron:"shnyah-DAH-nyeh",en:"breakfast",example_pl:"Jem śniadanie o ósmej.",example_en:"I eat breakfast at eight."},
{pl:"obiad",pron:"OH-byahd",en:"dinner / midday meal",example_pl:"Obiad jest gotowy.",example_en:"Dinner is ready."}
]},
{id:"shopping",title:"Shopping & Money",words:[
{pl:"sklep",pron:"sklep",en:"store / shop",example_pl:"Idę do sklepu.",example_en:"I'm going to the store."},
{pl:"ile to kosztuje",pron:"EE-leh toh koh-SHTOO-yeh",en:"how much does this cost",example_pl:"Ile to kosztuje?",example_en:"How much does this cost?"},
{pl:"tanie",pron:"TAH-nyeh",en:"cheap",example_pl:"To jest bardzo tanie.",example_en:"This is very cheap."},
{pl:"drogie",pron:"DROH-gyeh",en:"expensive",example_pl:"Ten hotel jest drogie.",example_en:"This hotel is expensive."},
{pl:"gotówka",pron:"goh-TOOF-kah",en:"cash",example_pl:"Płacę gotówką.",example_en:"I'm paying with cash."},
{pl:"karta",pron:"KAHR-tah",en:"card",example_pl:"Czy mogę zapłacić kartą?",example_en:"Can I pay by card?"},
{pl:"pieniądze",pron:"pyeh-NYON-dzeh",en:"money",example_pl:"Nie mam pieniędzy.",example_en:"I don't have money."},
{pl:"złoty",pron:"ZWOH-tih",en:"złoty (currency)",example_pl:"To kosztuje dwadzieścia złotych.",example_en:"That costs twenty złoty."},
{pl:"kupować",pron:"koo-POH-vahch",en:"to buy",example_pl:"Lubię kupować książki.",example_en:"I like buying books."},
{pl:"sprzedawca",pron:"spsheh-DAHF-tsah",en:"salesperson",example_pl:"Sprzedawca był miły.",example_en:"The salesperson was nice."}
]},
{id:"directions",title:"Directions & Places",words:[
{pl:"gdzie",pron:"gjeh",en:"where",example_pl:"Gdzie jest dworzec?",example_en:"Where is the train station?"},
{pl:"blisko",pron:"BLEE-skoh",en:"close / nearby",example_pl:"Sklep jest blisko.",example_en:"The store is nearby."},
{pl:"daleko",pron:"dah-LEH-koh",en:"far",example_pl:"To jest bardzo daleko.",example_en:"That's very far."},
{pl:"prosto",pron:"PROH-stoh",en:"straight ahead",example_pl:"Idź prosto.",example_en:"Go straight ahead."},
{pl:"lewo",pron:"LEH-voh",en:"left",example_pl:"Skręć w lewo.",example_en:"Turn left."},
{pl:"prawo",pron:"PRAH-voh",en:"right",example_pl:"Skręć w prawo.",example_en:"Turn right."},
{pl:"dworzec",pron:"DVOH-zhets",en:"train station",example_pl:"Dworzec jest w centrum.",example_en:"The station is downtown."},
{pl:"ulica",pron:"oo-LEE-tsah",en:"street",example_pl:"Mieszkam na tej ulicy.",example_en:"I live on this street."},
{pl:"centrum",pron:"TSEN-troom",en:"downtown / center",example_pl:"Pracuję w centrum.",example_en:"I work downtown."},
{pl:"toaleta",pron:"toh-ah-LEH-tah",en:"restroom",example_pl:"Gdzie jest toaleta?",example_en:"Where is the restroom?"}
]},
{id:"verbs",title:"Common Verbs (Dictionary Form)",words:[
{pl:"być",pron:"bihch",en:"to be",example_pl:"Chcę być lekarzem.",example_en:"I want to be a doctor."},
{pl:"mieć",pron:"myech",en:"to have",example_pl:"Chcę mieć psa.",example_en:"I want to have a dog."},
{pl:"chcieć",pron:"khchech",en:"to want",example_pl:"Chcę kawę.",example_en:"I want coffee."},
{pl:"iść",pron:"eeshch",en:"to go (on foot)",example_pl:"Muszę iść do domu.",example_en:"I have to go home."},
{pl:"jechać",pron:"YEH-khach",en:"to go (by vehicle)",example_pl:"Jadę do pracy autem.",example_en:"I go to work by car."},
{pl:"robić",pron:"ROH-beech",en:"to do / make",example_pl:"Co robisz dziś wieczorem?",example_en:"What are you doing tonight?"},
{pl:"mówić",pron:"MOO-veech",en:"to speak",example_pl:"Mówię trochę po polsku.",example_en:"I speak a little Polish."},
{pl:"lubić",pron:"LOO-beech",en:"to like",example_pl:"Lubię czytać książki.",example_en:"I like reading books."},
{pl:"widzieć",pron:"VEE-jech",en:"to see",example_pl:"Widzę górę.",example_en:"I see a mountain."},
{pl:"jeść",pron:"yeshch",en:"to eat",example_pl:"Lubię jeść owoce.",example_en:"I like eating fruit."},
{pl:"pić",pron:"peech",en:"to drink",example_pl:"Piję wodę codziennie.",example_en:"I drink water every day."},
{pl:"rozumieć",pron:"roh-ZOO-myech",en:"to understand",example_pl:"Nie rozumiem.",example_en:"I don't understand."},
{pl:"wiedzieć",pron:"VYEH-jech",en:"to know (a fact)",example_pl:"Nie wiem.",example_en:"I don't know."},
{pl:"pracować",pron:"prah-TSOH-vach",en:"to work",example_pl:"Pracuję w szkole.",example_en:"I work at a school."}
]},
{id:"questionwords",title:"Question Words",words:[
{pl:"co",pron:"tsoh",en:"what",example_pl:"Co robisz?",example_en:"What are you doing?"},
{pl:"kto",pron:"ktoh",en:"who",example_pl:"Kto to jest?",example_en:"Who is that?"},
{pl:"gdzie",pron:"gjeh",en:"where",example_pl:"Gdzie mieszkasz?",example_en:"Where do you live?"},
{pl:"kiedy",pron:"KYEH-dih",en:"when",example_pl:"Kiedy wracasz?",example_en:"When are you coming back?"},
{pl:"dlaczego",pron:"dlah-CHEH-goh",en:"why",example_pl:"Dlaczego jesteś smutny?",example_en:"Why are you sad?"},
{pl:"jak",pron:"yahk",en:"how",example_pl:"Jak się nazywasz?",example_en:"What's your name? (lit. how do you call yourself)"},
{pl:"ile",pron:"EE-leh",en:"how much / many",example_pl:"Ile to kosztuje?",example_en:"How much does this cost?"},
{pl:"czy",pron:"chih",en:"(marks a yes/no question)",example_pl:"Czy masz czas?",example_en:"Do you have time?"}
]},
{id:"adjectives",title:"Common Adjectives",words:[
{pl:"duży",pron:"DOO-zhih",en:"big",example_pl:"To jest duży dom.",example_en:"This is a big house."},
{pl:"mały",pron:"MAH-wih",en:"small",example_pl:"Mam małego psa.",example_en:"I have a small dog."},
{pl:"dobry",pron:"DOH-brih",en:"good",example_pl:"To jest dobry pomysł.",example_en:"That's a good idea."},
{pl:"zły",pron:"zwih",en:"bad",example_pl:"Mam zły dzień.",example_en:"I'm having a bad day."},
{pl:"nowy",pron:"NOH-vih",en:"new",example_pl:"Kupiłem nowy telefon.",example_en:"I bought a new phone."},
{pl:"stary",pron:"STAH-rih",en:"old",example_pl:"To jest stary budynek.",example_en:"This is an old building."},
{pl:"ładny",pron:"WAHD-nih",en:"pretty / nice",example_pl:"Masz ładny dom.",example_en:"You have a nice house."},
{pl:"zmęczony",pron:"zmen-CHOH-nih",en:"tired",example_pl:"Jestem bardzo zmęczony.",example_en:"I'm very tired."},
{pl:"szczęśliwy",pron:"shchen-SHLEE-vih",en:"happy",example_pl:"Jestem szczęśliwy.",example_en:"I am happy."},
{pl:"smutny",pron:"SMOOT-nih",en:"sad",example_pl:"Ona jest smutna dzisiaj.",example_en:"She is sad today."}
]}
];

/* ===================== GRAMMAR LESSONS ===================== */
const GRAMMAR_LESSONS = [
{id:"gender",title:"Noun Gender",
explanation_html:"<p>Every Polish noun has a gender — masculine, feminine, or neuter — and gender is usually predictable from the ending. <strong>Masculine</strong> nouns typically end in a consonant (dom, pies). <strong>Feminine</strong> nouns typically end in -a (kobieta, szkoła). <strong>Neuter</strong> nouns typically end in -o, -e, or -ę (dziecko, mieszkanie). Gender matters because it controls the endings of adjectives and past-tense verbs later on.</p>",
drills:[
{type:"mc",prompt:"What gender is \"kawa\" (coffee)?",options:["Masculine","Feminine","Neuter"],correct:1,explanation:"It ends in -a, the typical feminine ending."},
{type:"mc",prompt:"What gender is \"okno\" (window)?",options:["Masculine","Feminine","Neuter"],correct:2,explanation:"It ends in -o, the typical neuter ending."}
]},
{id:"byc-miec",title:"Personal Pronouns, \"być\" & \"mieć\"",
explanation_html:"<p>Subject pronouns (ja, ty, on...) are usually dropped in Polish, because the verb ending already tells you who's doing the action. Two verbs to know cold: <strong>być</strong> (to be) — jestem, jesteś, jest, jesteśmy, jesteście, są — and <strong>mieć</strong> (to have) — mam, masz, ma, mamy, macie, mają.</p>",
drills:[
{type:"mc",prompt:"How do you say \"I am\" in Polish?",options:["jesteś","jestem","jest","są"],correct:1,explanation:"jestem = I am (ja jestem, with the pronoun usually dropped)."},
{type:"fill",prompt:"Fill in: \"___ psa.\" (I have a dog.)",answer:"mam",acceptable:["mam"],explanation:"mam = I have."}
]},
{id:"cases-overview",title:"The Case System — Why It Exists",
explanation_html:"<p>Polish nouns, pronouns, and adjectives change their ending depending on their grammatical role in the sentence — a system of seven <strong>cases</strong>. English does a faint version of this with pronouns (I vs me vs my), but Polish does it to every noun, all the time. The seven cases are: Nominative (subject), Genitive (possession, negation), Dative (indirect object), Accusative (direct object), Instrumental (\"with\"), Locative (location), and Vocative (addressing someone directly). This guide focuses on the three most useful for a beginner: Nominative, Accusative, and Genitive.</p>",
drills:[
{type:"mc",prompt:"Which case is used for the subject of a sentence — the \"dictionary form\"?",options:["Genitive","Nominative","Instrumental"],correct:1,explanation:"Nominative is the base/dictionary form, used for the subject."},
{type:"mc",prompt:"Which case does Polish switch to specifically for negation (\"I don't have...\")?",options:["Accusative","Dative","Genitive"],correct:2,explanation:"Negation in Polish requires the genitive case for the object."}
]},
{id:"nom-acc",title:"Nominative vs Accusative",
explanation_html:"<p>Accusative is used for the direct object — the thing receiving the action, e.g. after \"mieć\" (to have) or \"lubić\" (to like). For most feminine nouns ending in -a, the accusative changes -a to -ę (kawa → kawę). For masculine inanimate and neuter nouns, the accusative usually looks identical to the nominative.</p>",
drills:[
{type:"fill",prompt:"\"I like coffee\" — kawa becomes ___ in the accusative.",answer:"kawę",acceptable:["kawe","kawę"],explanation:"Lubię kawę — the -a of kawa becomes -ę."},
{type:"mc",prompt:"\"Mam dom\" (I have a house) — why does \"dom\" stay unchanged?",options:["It's feminine","It's a masculine inanimate noun, unchanged in accusative","It's plural"],correct:1,explanation:"Masculine inanimate nouns typically look the same in nominative and accusative."}
]},
{id:"genitive-negation",title:"Genitive Case & Negation",
explanation_html:"<p>Polish negation switches the object into the genitive case, not accusative. \"Mam psa\" (I have a dog, accusative) becomes \"Nie mam psa\" (I don't have a dog, genitive) — for feminine nouns the change is clearer: \"Mam kawę\" → \"Nie mam kawy.\" Genitive also expresses possession and follows prepositions like \"bez\" (without) and \"do\" (to).</p>",
drills:[
{type:"fill",prompt:"\"I don't have coffee\" — kawa in genitive after negation is ___.",answer:"kawy",acceptable:["kawy"],explanation:"Nie mam kawy — genitive ending -y after negation."},
{type:"mc",prompt:"\"Nie mam czasu\" means:",options:["I have time","I don't have time","I want time"],correct:1,explanation:"Nie mam czasu = I don't have time (genitive after negation)."}
]},
{id:"present-tense",title:"Present Tense Conjugation Patterns",
explanation_html:"<p>Most Polish verbs fall into predictable patterns. Verbs ending in -ać like \"czytać\" (to read) conjugate: czytam, czytasz, czyta, czytamy, czytacie, czytają. Verbs ending in -ować like \"pracować\" (to work) swap -ować for -uję/-ujesz/-uje etc: pracuję, pracujesz, pracuje. That single -ować pattern unlocks hundreds of common verbs.</p>",
drills:[
{type:"fill",prompt:"\"I work\" — from pracować, the \"ja\" form is ___.",answer:"pracuję",acceptable:["pracuje","pracuję"],explanation:"pracuję — the -ować pattern conjugates to -uję for \"ja\"."},
{type:"mc",prompt:"What is \"ty czytasz\" in English?",options:["I read","you read","we read"],correct:1,explanation:"czytasz is the \"ty\" (you, singular) form of czytać."}
]},
{id:"adjective-agreement",title:"Adjective Agreement",
explanation_html:"<p>Adjectives change their ending to match the gender of the noun they describe: masculine typically -y (ładny dom), feminine -a (ładna kobieta), neuter -e (ładne dziecko). This also applies when describing yourself — a man says \"jestem zmęczony,\" a woman says \"jestem zmęczona.\"</p>",
drills:[
{type:"mc",prompt:"A woman wants to say \"I am tired.\" Which is correct?",options:["Jestem zmęczony","Jestem zmęczona","Jestem zmęczone"],correct:1,explanation:"zmęczona is the feminine form, matching a female speaker."},
{type:"fill",prompt:"\"a nice child\" — dziecko is neuter, so ładny becomes ___.",answer:"ładne",acceptable:["ladne","ładne"],explanation:"Neuter adjectives typically end in -e: ładne dziecko."}
]},
{id:"questions",title:"Asking Questions",
explanation_html:"<p>Key question words: co (what), kto (who), gdzie (where), kiedy (when), dlaczego (why), jak (how), ile (how much/many). \"Czy\" has no direct English translation — it just flags that a yes/no question is coming, similar to the upside-down question mark in Spanish.</p>",
drills:[
{type:"mc",prompt:"Which word turns a statement into a yes/no question?",options:["co","czy","gdzie"],correct:1,explanation:"czy flags a yes/no question is coming."},
{type:"fill",prompt:"\"Where is the train station?\" — Gdzie jest ___?",answer:"dworzec",acceptable:["dworzec"],explanation:"dworzec = train station."}
]},
{id:"prepositions",title:"Prepositions & the Cases They Take",
explanation_html:"<p>Every Polish preposition demands a specific case from the noun that follows. \"w\"/\"na\" (in/on) take the Locative. \"do\" (to/toward) takes the Genitive. \"z\" (from/with) can take Genitive (from) or Instrumental (with). This is why prepositional phrases are often memorized as fixed chunks before the full case system is mastered.</p>",
drills:[
{type:"mc",prompt:"\"do sklepu\" (to the store) uses which case?",options:["Nominative","Genitive","Instrumental"],correct:1,explanation:"do always takes the genitive case."},
{type:"fill",prompt:"\"in Poland\" — w ___. (Polska takes the locative ending -ce)",answer:"Polsce",acceptable:["polsce","Polsce"],explanation:"w Polsce — Locative case after \"w\"."}
]},
{id:"past-tense",title:"Past Tense (and Why It's Gendered)",
explanation_html:"<p>Polish past tense agrees with the speaker's own gender, not just the noun's. Formed from the infinitive stem + -ł- + a personal ending: a man says \"byłem\" (I was), a woman says \"byłam.\" \"On był\" (he was) vs \"ona była\" (she was).</p>",
drills:[
{type:"mc",prompt:"A man says \"I was in Poland.\" Which is correct?",options:["Byłam w Polsce","Byłem w Polsce","Był w Polsce"],correct:1,explanation:"Byłem is the masculine \"I was\" form."},
{type:"fill",prompt:"\"She did\" (robić) — ona ___.",answer:"robiła",acceptable:["robila","robiła"],explanation:"robiła = feminine past tense of robić."}
]},
{id:"future-aspect",title:"Future Tense & a Note on Aspect",
explanation_html:"<p>The simplest future: <strong>będę + infinitive</strong> — będę czytać (I will read), będę pracować (I will work). Honest heads-up: Polish verbs come in aspect pairs (imperfective/perfective, e.g. czytać vs przeczytać) that change meaning in ways English doesn't mark — widely considered the hardest part of Polish grammar. The będę + infinitive pattern is enough for everyday beginner conversations; full aspect mastery is the next mountain after this.</p>",
drills:[
{type:"fill",prompt:"\"I will work\" — Będę ___.",answer:"pracować",acceptable:["pracowac","pracować"],explanation:"będę + infinitive is the simplest beginner future."},
{type:"mc",prompt:"What's the honest note this lesson makes about verb aspect?",options:["It's simple and covered fully here","It's the hardest part of Polish grammar and takes years to master","It doesn't matter for beginners"],correct:1,explanation:"Aspect is a real, deep topic this guide deliberately doesn't try to fully teach."}
]},
{id:"numeral-agreement",title:"Numbers & Noun Agreement",
explanation_html:"<p>The noun after a number changes form depending on the number: 1 takes the normal singular (jeden dom), 2-4 take a special plural form (dwa domy), and 5+ take the genitive plural (pięć domów). This is a genuinely distinctive Polish pattern with no real English equivalent — most learners just memorize the three-way split and get faster with exposure.</p>",
drills:[
{type:"mc",prompt:"Which numbers trigger the genitive plural noun form (like \"pięć domów\")?",options:["1 only","2, 3, and 4","5 and above"],correct:2,explanation:"5+ takes the genitive plural ending."},
{type:"fill",prompt:"\"three houses\" — dom becomes ___ after trzy (2-4 pattern).",answer:"domy",acceptable:["domy"],explanation:"trzy domy — the 2-4 plural form."}
]}
];
