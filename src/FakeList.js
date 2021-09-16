import country_city_list from './cities_countries.json'

function makeCountryCityListOneDimensional(oldList) {
	const newList = [];
	let idx = 0;
	Object.keys(oldList).forEach(function(countryName) {
		oldList[countryName].forEach(function(cityName) {
			newList.push(<div key={idx++}>{cityName}, {countryName}</div>);
		});
	});
	return newList;
}

const niceCityList = makeCountryCityListOneDimensional(country_city_list);

export default niceCityList;
