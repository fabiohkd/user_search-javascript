//https://randomuser.me/api/?results=100&seed=promise&nat=us,fr,au,br
//https://restcountries.eu/rest/v2/all

let globalUsers = [];
let globalCountries = [];
let globalUsersAndCountries = [];
let globalResultUsers = [];

let quantityUsers = null;
let textSearch = null;
let quantity = null;
let numberFormat = null;

function start() {
  numberFormat = Intl.NumberFormat('pt-BR');
  quantityUsers = document.querySelector('#quantityUsers');
  textSearch = document.querySelector('#textSearch');
  quantityUsers.focus();
  quantityUsers.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
    if (event.target.value != '' && event.key === 'Enter') {
      quantity = event.target.value;
      getUsers();
      event.target.value = '';
      textSearch.focus();
    }
  });

  textSearch.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }

    if (event.target.value != '' && event.key === 'Enter') {
      searchUsers(event.target.value);
      render(globalResultUsers);
      totalSummary(globalResultUsers);

      event.target.value = '';
      textSearch.focus();
    } else {
      console.log('GlobalUsersAndCountries');
      render(globalUsersAndCountries);
      totalSummary(globalUsersAndCountries);
      textSearch.focus();
    }
  });
}

async function getUsers() {
  await fetchUsers(quantity);
  await fetchCountries();
  mergeUsersAndCountries();
  render(globalUsersAndCountries);
  totalSummary(globalUsersAndCountries);
}

function searchUsers(text) {
  globalResultUsers = globalUsersAndCountries.filter((user) => {
    return user.userName.toLowerCase().includes(text.toLowerCase());
  });
  globalResultUsers.sort((a, b) => {
    return a.userName.localeCompare(b.userName);
  });
  //   console.log(globalResultUsers);
}

function formatNumber(number) {
  return numberFormat.format(number);
}

async function fetchUsers(quantity) {
  globalUsers = [];
  let apiUsers = null;
  apiUsers = 'https://randomuser.me/api/?results=' + quantity + '&seed=promise';
  const res = await fetch(apiUsers);
  const json = await res.json();

  globalUsers = json.results.map(
    ({ name, gender, location, dob, picture, nat }) => {
      return {
        userName: name.first + ' ' + name.last,
        userGender: gender,
        userCity: location.city,
        userState: location.state,
        userCountry: location.country,
        userAge: dob.age,
        userPicture: picture.large,
        userNat: nat,
      };
    }
  );
}

async function fetchCountries() {
  globalCountries = [];
  const res = await fetch('https://restcountries.eu/rest/v2/all');
  const json = await res.json();

  globalCountries = json.map(
    ({ name, alpha2Code, capital, region, population, flag }) => {
      return {
        countryName: name,
        countryCode: alpha2Code,
        countryCapital: capital,
        countryRegion: region,
        countryPopulation: population,
        countryFlag: flag,
      };
    }
  );
}

function mergeUsersAndCountries() {
  globalUsersAndCountries = [];
  globalUsers.forEach((user) => {
    const userCountry = globalCountries.find((country) => {
      return country.countryCode === user.userNat;
      console.log('teste');
    });
    globalUsersAndCountries.push({
      ...user,
      ...userCountry,
    });
    globalUsersAndCountries.sort((a, b) => {
      return a.userName.localeCompare(b.userName);
    });
  });
}

function totalSummary(nameSummary) {
  let length = nameSummary.length;

  let male = nameSummary.filter((male) => {
    return male.userGender === 'male';
  });
  let totalMale = male.length;

  let female = nameSummary.filter((female) => {
    return female.userGender === 'female';
  });
  let totalFemale = female.length;

  let totalAges = nameSummary.reduce((acc, curr) => {
    return acc + curr.userAge;
  }, 0);
  let avgAges = totalAges / length;
  avgAges = avgAges.toFixed(2);

  let totalPopulation = nameSummary.reduce((acc, curr) => {
    return acc + curr.countryPopulation;
  }, 0);

  const divStatistc = document.querySelector('#divStatistic');
  divStatistc.innerHTML = '';
  divStatistc.innerHTML = `
    <div class='flex-row-statistic'>
      <div>
        <ul>
          <li>Total Users: ${formatNumber(length)}</li>
          <li>Total Male Users: ${formatNumber(totalMale)}</li>
          <li>Total Female Users: ${formatNumber(totalFemale)}</li>
        </ul>
      </div>
      <div>
        <ul>
          <li>Total Ages: ${formatNumber(totalAges)}</li>
          <li>Average Ages: ${formatNumber(avgAges)}</li>
          <li>Average Ages: ${formatNumber(totalPopulation)}</li>
        </ul>
      </div>
    </div>
  `;
}

function promiseUsers() {
  return new Promise(async (resolve, reject) => {
    await fetchUsers(quantity);
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

function promiseCountries() {
  return new Promise(async (resolve, reject) => {
    await fetchCountries();
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

function render(nameRender) {
  const divUsers = document.querySelector('#divUsers');
  divUsers.innerHTML = '';
  divUsers.innerHTML = `
    <div class='row'>
        ${nameRender
          .map((item) => {
            return `
            <div class='col s2 m3 l4'>
                <div class='flex-row card-panel hoverable'>
                    <div class='flex-column'>
                        <img class='avatar' src='${item.userPicture}'/>
                        <span>${item.userName}</span><br>
                    <div class='flex-column'>
                            <ul>
                            <li><strong>Age: </strong>${item.userAge}</li>
                            <li><strong>Gender: </strong>${item.userGender}</li>
                            <li><strong>City: </strong>${item.userCity}</li>
                            <li><strong>State: </strong>${item.userState}</li>
                            </ul>
                        </div>
                    </div>
                    <div class='flex-column'>
                        <img class='flag' src='${item.countryFlag}'/>
                        <span><strong>${item.countryName}</strong></span>
                        <span><strong>${item.countryCode}</strong></span>
                        <ul>
                            <li><strong>Capital: </strong>${
                              item.countryCapital
                            }</li>
                            <li><strong>Reg: </strong>${item.countryRegion}</li>
                            <li><strong>Pop: </strong>${formatNumber(
                              item.countryPopulation
                            )}</li>
                        </ul>
                    </div>
                </div>
            </div>
            `;
          })
          .join('')}
    </div>
    `;
}

start();
