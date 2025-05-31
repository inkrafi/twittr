document.addEventListener('DOMContentLoaded', () => {

  const usernameLoggedIn = localStorage.getItem('usernameLoggedIn');

  const twittForm = document.getElementById('twittForm');
  const ownerPhoto = document.getElementById('ownerPhoto');
  const twittContent = document.getElementById('twittContent');
  const twittsWrapper = document.getElementById('twittsWrapper');

  const instantFeedback = document.getElementById('instantFeedback');

  instantFeedback.style.display = 'none';

  let selectedFeeling = null;

  const feelingItems = document.querySelectorAll('.item-feeling');

  feelingItems.forEach(item => {
    item.addEventListener('click', () => {
      selectedFeeling = item.getAttribute('data-feeling');
      feelingItems.forEach(i => i.classList.remove('border-[#1880E8]'));
      item.classList.add('border-[#1880E8]');
    })
  })

  const twittManager = new Twitt();
  const userManager = new User();

  // custom format tanggal (d F Y)
  const now = new Date();
  const year = now.getFullYear();
  
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const month = monthNames[now.getMonth()];
  const day = now.getDate();

  const twittUsers = userManager.getUsers();

  const ownerLoggedIn = twittUsers.find(user => user.username.toLowerCase() === usernameLoggedIn.toLowerCase());
  // ownerPhoto.src = 'assets/man1.png';
  ownerPhoto.src = ownerLoggedIn.avatar || 'assets/user.png';

  // mengunjungi profile sendiri
  document.getElementById('btnVisitMyProfile').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.setItem('usernameProfileChosen', usernameLoggedIn);
    window.location.href = '../profile.html';
  });

  twittForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const twittData = {
      twittContent: twittContent.value,
      twittUsernameOwner: usernameLoggedIn,
      twittFeeling: selectedFeeling,
      twittCreatedAt: `${day} ${month} ${year}`,
    }

    const result = twittManager.saveTwitt(twittData);

    if (result.success) {
      instantFeedback.style.display = 'none';
      twittContent.value = '';
      twittFeeling = null;

      feelingItems.forEach(item => {
        item.classList.remove('border-[#1880E8]');
      })

      displayAllTwitts(twittManager.getTwitts());
    } else {
      instantFeedback.style.display = 'flex';
      instantFeedback.textContent = result.error;
    }
  })

  const existingTwitts = twittManager.getTwitts();

  function displayAllTwitts(twitts = existingTwitts) {
    if (twitts.length === 0) {
      console.log('Data tidak tersedia');
    } else {
      twittsWrapper.innerHTML = '';

      twitts.sort((a,b) => b.id - a.id);

      twitts.forEach(twitt => {
        const ownerTwitt = twittUsers.find(user => user.username.toLowerCase() === twitt.twittUsernameOwner.toLowerCase());

        // Ambil data like terbaru setiap kali menampilkan twitt
        const freshLoveTwitts = twittManager.getLoveTwitts();
        const getAllLoveTwitts = freshLoveTwitts.filter(loveTwitt => loveTwitt.twittId === twitt.id);
        const countLoveTwitts = getAllLoveTwitts.length;

        const hasLiked = twittManager.userHasLikedTwittValidate(twitt.id, usernameLoggedIn);

        const itemTwitt = document.createElement('div');
        itemTwitt.className = 'bg-primary p-4 border-b-2 border-line';
        itemTwitt.id = `twitt-${twitt.id}`;
        itemTwitt.innerHTML =
        `
          <div class="flex items-center justify-between">
              <div class="flex items-center justify-start">
                  <img id="visitProfile-${ownerTwitt.username}" src="assets/user.png" id="ownerPhoto" alt="search" srcset=""
                      class="object-cover w-[46px] h-[46px] rounded-full">
                  <div class="pl-2">
                      <div class="flex gap-1">
                          <p class="text-base font-bold inline-block">${ownerTwitt.name} <img src="assets/verify.png"
                                  alt="" srcset="" class="inline w-5 h-5 rounded-full"> </p>
                      </div>
                      <p class="text-username text-sm">@${twitt.twittUsernameOwner} • ${twitt.twittCreatedAt}</p>
                  </div>
              </div>
              <div
                  class="flex justify-center items-center rounded-full px-3 py-1.5 border-line border-2 gap-1.5">
                  <p class="text-sm font-semibold">${twitt.twittFeeling}</p>
              </div>
          </div>

          <p class="pl-[55px] py-2.5 leading-7 text-base">
              ${twitt.twittContent}
          </p>

          <div class="flex justify-between items-center pl-[55px] w-[484px]">
              <div class="flex justify-center items-center gap-2.5 pr-[250px]">
                  <a href="#" id="loveTwitt-${twitt.id}" class="cursor flex justify-start items-center w-[93px] gap-1.5">
                      <img class="like-icon-${twitt.id}" src="assets/${hasLiked ? `heart-fill.svg` : `heart.svg`}" alt="heart">
                      <p id="totalLikeThatTwitt-${twitt.id}" class="text-sm font-normal ${hasLiked ? `text-like` : `text-username`}">
                        ${countLoveTwitts} ${countLoveTwitts <=1 ? ' Like' : ' Likes' }
                      </p>
                  </a>
                  ${twitt.twittUsernameOwner === usernameLoggedIn ?
                  `<a href="#" id="deleteTwitt-${twitt.id}" class="cursor flex justify-start items-center w-[93px] gap-1.5">
                      <img src="assets/trash.svg" alt="heart">
                      <p class="text-sm font-normal text-username">Delete</p>
                  </a>`
                  :
                  `<a href="#" class="flex justify-start items-center w-[93px] gap-1.5">
                      <img src="assets/warning-2.svg">
                      <p class="text-sm font-normal text-username">Report</p>
                  </a>`
                  }
              </div>
          </div>
        `;

        twittsWrapper.append(itemTwitt);

        itemTwitt.querySelector(`#visitProfile-${ownerTwitt.username}`).addEventListener('click', function(e) {
          e.preventDefault();
          localStorage.setItem('usernameProfileChosen', ownerTwitt.username);
          window.location.href = '../profile.html';
        }) 

        // Gunakan ID unik untuk setiap elemen
        const totalLikeThatTwitt = itemTwitt.querySelector(`#totalLikeThatTwitt-${twitt.id}`);
        const likeIcon = itemTwitt.querySelector(`.like-icon-${twitt.id}`);

        // event listener untuk like
        itemTwitt.querySelector(`#loveTwitt-${twitt.id}`).addEventListener('click', function(e) {
          e.preventDefault();

          const loveTwittData = {
            twittId: twitt.id,
            userId: usernameLoggedIn,
          };

          // Cek status like saat ini
          const currentHasLiked = twittManager.userHasLikedTwittValidate(twitt.id, usernameLoggedIn);
          
          if (currentHasLiked) {
            // Jika sudah like, maka unlike
            const result = twittManager.unlikeTwitt(loveTwittData);
            
            if (result.success) {
              // Ambil data like terbaru dari localStorage
              const updatedLoveTwitts = twittManager.getLoveTwitts();
              const updatedCount = updatedLoveTwitts.filter(loveTwitt => loveTwitt.twittId === twitt.id).length;
              
              // Update tampilan dengan jumlah like yang benar
              totalLikeThatTwitt.textContent = updatedCount + (updatedCount <= 1 ? ' Like' : ' Likes');
              totalLikeThatTwitt.classList.remove('text-like');
              totalLikeThatTwitt.classList.add('text-username');
              likeIcon.src = 'assets/heart.svg';
            } else {
              instantFeedback.style.display = 'flex';
              instantFeedback.textContent = result.error;
            }
          } else {
            // Jika belum like, maka like
            const result = twittManager.loveTwitt(loveTwittData);

            if (result.success) {
              // Ambil data like terbaru dari localStorage
              const updatedLoveTwitts = twittManager.getLoveTwitts();
              const updatedCount = updatedLoveTwitts.filter(loveTwitt => loveTwitt.twittId === twitt.id).length;
              
              // Update tampilan dengan jumlah like yang benar
              totalLikeThatTwitt.textContent = updatedCount + (updatedCount <= 1 ? ' Like' : ' Likes');
              totalLikeThatTwitt.classList.remove('text-username');
              totalLikeThatTwitt.classList.add('text-like');
              likeIcon.src = 'assets/heart-fill.svg';
            } else {
              instantFeedback.style.display = 'flex';
              instantFeedback.textContent = result.error;
            }
          }
        })

        // event listener untuk delete
        const deleteTwittButton = itemTwitt.querySelector(`#deleteTwitt-${twitt.id}`);

        if (deleteTwittButton) {
          deleteTwittButton.addEventListener('click', function(e) {
            e.preventDefault();

            const result = twittManager.deleteTwitt(twitt.id);
            console.log(result);

            if (result.success) {
              displayAllTwitts(twittManager.getTwitts());
            } else {
              instantFeedback.style.display = 'flex';
              instantFeedback.textContent = result.error;
            }
          })
        }
      })
    }
  }

  displayAllTwitts();
})