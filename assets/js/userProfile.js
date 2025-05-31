document.addEventListener('DOMContentLoaded', () => {

  const usernameLoggedIn = localStorage.getItem('usernameLoggedIn');
  const usernameProfileChosen = localStorage.getItem('usernameProfileChosen');

  const ownerPhoto = document.getElementById('ownerPhoto');
  const twittsWrapper = document.getElementById('twittsWrapper');
  const userProfileName = document.getElementById('userProfileName');
  const userProfileUsername = document.getElementById('userProfileUsername');

  const twittManager = new Twitt();
  const userManager = new User();

  const twittUsers = userManager.getUsers();

  const userProfileChosen = twittUsers.find(user => user.username.toLowerCase() === usernameProfileChosen.toLowerCase());

  ownerPhoto.src = userProfileChosen.avatar || 'assets/user.png';
  userProfileName.textContent = userProfileChosen.name;
  userProfileUsername.textContent = '@' + userProfileChosen.username;

  // Hide edit profile button if not viewing own profile
  const editProfileBtn = document.getElementById('editProfileBtn');
  if (usernameLoggedIn.toLowerCase() !== usernameProfileChosen.toLowerCase()) {
    editProfileBtn.style.display = 'none';
  }

  const existingTwitts = twittManager.getTwitts();

  const userProfileTwitts = existingTwitts.filter(twitt => twitt.twittUsernameOwner === usernameProfileChosen);

  function displayAllTwitts(twitts = userProfileTwitts) {
    if (twitts.length === 0) {
      twittsWrapper.innerHTML = 'Tidak ada postingan terbaru.';
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
              displayAllTwitts(twittManager.getTwitts().filter(twitt => twitt.twittUsernameOwner === usernameProfileChosen));
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

  // Tambahkan referensi ke elemen profil lainnya
  // const userProfileBio = document.querySelector('.leading-[26px].text-sm');
  const userProfileBio = document.getElementById('userProfileBio');
  // const followBtn = document.getElementById('followBtn');
  // const editProfileBtn = document.getElementById('editProfileBtn');
  const editProfileModal = document.getElementById('editProfileModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const editProfileForm = document.getElementById('editProfileForm');
  const profilePhotoInput = document.getElementById('profilePhoto');
  const profilePhotoPreview = document.getElementById('profilePhotoPreview');
  const choosePhotoBtn = document.getElementById('choosePhotoBtn');
  const profileNameInput = document.getElementById('profileName');
  const profileBioInput = document.getElementById('profileBio');

  // Event listener untuk tombol Edit Profile
  editProfileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Ambil data user saat ini
    const currentUser = twittUsers.find(user => user.username.toLowerCase() === usernameLoggedIn.toLowerCase());
    
    // Isi form dengan data user saat ini
    if (currentUser) {
      profilePhotoPreview.src = currentUser.avatar || 'assets/user.png';
      profileNameInput.value = currentUser.name || '';
      profileBioInput.value = currentUser.bio || '';
    }
    
    // Tampilkan modal
    editProfileModal.classList.remove('hidden');
  });
  
  // Event listener untuk tombol Close Modal
  closeModalBtn.addEventListener('click', () => {
    editProfileModal.classList.add('hidden');
  });
  
  // Tutup modal jika klik di luar modal
  editProfileModal.addEventListener('click', (e) => {
    if (e.target === editProfileModal) {
      editProfileModal.classList.add('hidden');
    }
  });
  
  // Event listener untuk tombol Choose Photo
  choosePhotoBtn.addEventListener('click', () => {
    profilePhotoInput.click();
  });
  
  // Event listener untuk perubahan file foto
  profilePhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePhotoPreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Event listener untuk submit form
  editProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const updateData = {
      name: profileNameInput.value,
      bio: profileBioInput.value
    };
    
    // Tambahkan avatar jika ada perubahan foto
    if (profilePhotoPreview.src.startsWith('data:')) {
      updateData.avatar = profilePhotoPreview.src;
    }
    
    // Update data user
    const result = userManager.updateUser(usernameLoggedIn, updateData);
    
    if (result.success) {
      // Update tampilan profil
      userProfileName.textContent = updateData.name;
      userProfileBio.textContent = updateData.bio || 'Belum ada bio';
      if (updateData.avatar) {
        ownerPhoto.src = updateData.avatar;
      }
      
      // Tutup modal
      editProfileModal.classList.add('hidden');
      
      // Tampilkan pesan sukses
      alert('Profil berhasil diperbarui!');
    } else {
      alert(result.error || 'Gagal memperbarui profil');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
    const usernameLoggedIn = localStorage.getItem('usernameLoggedIn');
    const authButtons = document.getElementById('authButtons');
    const mobileSignUp = document.querySelectorAll('a[href="register.html"]');

    if (usernameLoggedIn) {
        // User is logged in
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="login.html" class="flex gap-4">
                    <img src="assets/group.svg" alt="" class="w-7 h7">
                    <p class="text-xl">Sign Out</p>
                </a>
            `;
        }
        // Hide sign up buttons on mobile
        mobileSignUp.forEach(btn => btn.style.display = 'none');
    }
});