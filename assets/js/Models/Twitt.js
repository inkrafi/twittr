class Twitt {

  constructor() {
    this._twitts = null;
    this._loveTwitts = null;
  }

  getTwitts() {
    if (this._twitts === null) {
      try {
        const storedTwitts = localStorage.getItem('twitts');
        this._twitts = storedTwitts ? JSON.parse(storedTwitts) : [];
      } catch (error) {
        return this._twitts = [];
      }
    }
    return this._twitts;
  }

  getLoveTwitts() {
    // Selalu ambil data terbaru dari localStorage
    try {
      const storedLoveTwitts = localStorage.getItem('lovetwitts');
      this._loveTwitts = storedLoveTwitts ? JSON.parse(storedLoveTwitts) : [];
    } catch (error) {
      return this._loveTwitts = [];
    }
    return this._loveTwitts;
  }

  userHasLikedTwittValidate(twittId, userId) {
    // pengecekan apakah user telah memberikan like
    const loveTwitts = this.getLoveTwitts();
    
    return loveTwitts.some(twitt => twitt.twittId === twittId && twitt.userId === userId);
  }

  unlikeTwitt(loveTwittData) {
    const { twittId, userId } = loveTwittData;

    // validasi apakah user sudah like
    if (!this.userHasLikedTwittValidate(twittId, userId)) {
      return {
        success: false,
        error: 'kamu belum memberikan like pada twitt ini'
      }
    }

    // ambil data love twitts
    const loveTwitts = this.getLoveTwitts();
    
    // cari indeks love twitt yang akan dihapus
    const index = loveTwitts.findIndex(
      twitt => twitt.twittId === twittId && twitt.userId === userId
    );

    // hapus love twitt dari array
    loveTwitts.splice(index, 1);

    try {
      localStorage.setItem('lovetwitts', JSON.stringify(loveTwitts));
      this._loveTwitts = null; // reset cache
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error: 'gagal menghapus like'
      }
    }
  }

  loveTwitt(loveTwittData) {
    const { twittId, userId } = loveTwittData;

    // validasi
    if (this.userHasLikedTwittValidate(twittId, userId)) {
      // Jika sudah like, maka unlike
      return this.unlikeTwitt(loveTwittData);
    }

    const newLoveTwitt = {
      id: Date.now(),
      ...loveTwittData
    };

    const loveTwitts = this.getLoveTwitts();
    loveTwitts.push(newLoveTwitt);

    try {
      localStorage.setItem('lovetwitts', JSON.stringify(loveTwitts));
      this._loveTwitts = null;
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
      }
    }
  }

  saveTwitt(twittData) {
    const { twittContent, twittFeeling } = twittData;

    if (typeof twittContent !== 'string' || twittContent.trim() === '') {
      return {
        success: false,
        error: 'twitt content is missing'
      }
    }

    if (typeof twittFeeling !== 'string' || twittFeeling.trim() === '') {
      return {
        success: false,
        error: 'feeling is missing'
      }
    }

    if (twittContent.length > 150) {
      return {
        success: false,
        error: 'content is too long!'
      }
    }

    const newTwitt = {
      id: Date.now(),
      isActive: true,
      ...twittData
    }

    const twitts = this.getTwitts();
    twitts.push(newTwitt);

    try {
      localStorage.setItem('twitts', JSON.stringify(twitts));
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
      }
    }
  }

  deleteTwitt(twittId) {
    const twitts = this.getTwitts();
    const index = twitts.findIndex(twitt => twitt.id === twittId);
    console.log(index);
    if (index !== -1) {
      this._twitts.splice(index, 1);
      try {
        localStorage.setItem('twitts', JSON.stringify(this._twitts));
        return {
          success: true,
        }
      } catch (error) {
        return {
          success: false,
          error: 'twitt not found'
        }
      }
    }
  }

}