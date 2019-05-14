import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // ログインユーザーの取得
    login_user: null,
    // デフォルトでサイドバーを閉じた状態にする
    drawer: false,
    addresses: [],
    posts: []
  },
  mutations: {
    setLoginUser (state, user) {
      state.login_user = user
    },
    deleteLoginUser (state) {
      state.login_user = null
    },

    toggleSideMenu (state) {
      state.drawer = !state.drawer
    },
    addAddress (state, { id, address }) {
      address.id = id
      state.addresses.push(address)
    },
    updateAddress (state, { id, address }) {
      const index = state.addresses.findIndex(address => address.id === id)

      state.addresses[index] = address
    },
    deleteAddress (state, { id }) {
      const index = state.addresses.findIndex(address => address.id === id)

      state.addresses.splice(index, 1)
    },
    // stateにmessageを押し出す
    addPost (state, post) {
      state.posts.push(post)
    }
  },
  // コンポーネントのインターフェイスとなる部分
  actions: {
    // ユーザーを格納するためのメソッド
    setLoginUser ({ commit }, user) {
      commit('setLoginUser', user)
    },
    // firestoreからデータの取得
    fetchAddresses ({ getters, commit }) {
      firebase.firestore().collection(`users/${getters.uid}/addresses`).get().then(snapshot => {
        snapshot.forEach(doc => commit('addAddress', { id: doc.id, address:  doc.data() }))
      })
    },
    login () {
      const google_auth_provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(google_auth_provider)
    },
    // firebaseのログアウトを呼び出す機能
    logout () {
      firebase.auth().signOut()
    },
    deleteLoginUser ({ commit }) {
      commit('deleteLoginUser')
    },
    // コンテキストオブジェクトが{commit}はコミットメソッドのみを使用するために適用
    toggleSideMenu ({ commit }) {
      // commitメソッドは、mutationsのメソッドを呼ぶ際に使用
      commit('toggleSideMenu')
    },
    addAddress ({ getters, commit }, address) {
      if (getters.uid) {
        firebase.firestore().collection(`users/${getters.uid}/addresses`).add(address).then(doc => {
          commit('addAddress', { id: doc.id, address })
        })
      }
    },
    updateAddress ({ getters, commit }, { id, address }) {
      if (getters.uid) {
        firebase.firestore().collection(`users/${getters.uid}/addresses`).doc(id).update(address).then(() => {
          commit('updateAddress', { id, address })
        })
      }
    },
    deleteAddress ({ getters, commit }, { id }) {
      if (getters.uid) {
        firebase.firestore().collection(`users/${getters.uid}/addresses`).doc(id).delete().then(() => {
          commit('deleteAddress', { id })
        })
      }
    },
    // ミューテーションにpostを受け渡す
    addPost ({commit}, post) {
      commit('addPost', post)
    }
  },
  getters: {
    // ログインユーザーがnullの場合displayNameを参照するとエラーになるのを防ぐため
    userName: state => state.login_user ? state.login_user.displayName : '',
    photoURL: state => state.login_user ? state.login_user.photoURL : '',
    uid: state => state.login_user ? state.login_user.uid : null,
    getAddressById: state => id => state.addresses.find(address => address.id === id)
  }
})
