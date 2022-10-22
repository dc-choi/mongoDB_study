var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const xlsx = require('xlsx');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const data = xlsx.readFile('./data.xlsx');
const sheetName = data.SheetNames[0];
const firstSheet = data.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json( firstSheet, { defval : "" } );
// console.log(jsonData);

// const getExcel = async () => {
// 	const workbook = new excel.Workbook();
// 	const data = await workbook.xlsx.readFile('./식품성분표(9개정판).xlsx');
// 	console.log(data._worksheets);
// };
// getExcel();

mongoose.connect('mongodb+srv://dbname:password@cluster0.cmyck5l.mongodb.net/?retryWrites=true&w=majority')
.then(() => { console.log('mongo DONE!'); })
.catch((error) => { console.log(error); });

const excelDataSchema = new mongoose.Schema(
	{
		Index: Number,
		FoodGroup: String,
		FoodCode: String,
		Description_KOR: String,
		Description_ENG: String
	},
	{
		timestamps: true // 논리적 삭제를 돕는 deleteAt은 없음...
	}
);

const excelData = mongoose.model('excelData', excelDataSchema);

// excelData.create(jsonData);

const createData = async () => {
	const dbData = await excelData.create(
		{
			index: 1,
			FoodGroup: '곡류및그제품',
			FoodCode: 'A003000A010a',
			Description_KOR: '기장, 도정, 생것',
			Description_ENG: 'Prosomillet, Polished, Raw'
		}
	);
	console.log(`createData: ${dbData}`);
};

const updateData = async () => {
	const data = await excelData.updateOne(
		{
			index: 1
		},
		{
			FoodGroup: '공류 및 그 제품'
		}
	);
	console.log(`updateData: ${data}`);
};

const removeData = async () => {
	const data = await excelData.deleteOne({
		FoodCode: 'A003000A010a'
	});
	console.log(`removeData: ${data}`);
};

const getData = async () => {
	const data = await excelData.find({ Description_KOR: { $regex: '생것' } }, 'foodCode').exec();
	console.log(`getData: ${data}`);
};

createData();
updateData();
getData();
// removeData();

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
