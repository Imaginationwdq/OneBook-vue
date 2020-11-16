<template>
  <el-container class="home-container">
    <!--顶部-->
    <el-header>
      <div>
        <img src="../assets/img/home_logo.png" alt="">
        <span>壹本书舍-后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '180px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--侧边栏菜单区-->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :collapse="isCollapse"
          :collapse-transition="false"
          unique-opened
          router
          :default-active="activePath">
          <!--一级菜单-->
          <el-submenu :index="item.id" v-for="item in menuelist" :key="item.id">
            <template slot="title">
              <!--图标-->
              <i :class="iconObj[item.iconId]"></i>
              <!--文本-->
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconObj[subItem.iconId]"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧主体-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data() {
      return {
        // 菜单列表
        menuelist: [],
        // 菜单的图标列表
        iconObj: {},
        isCollapse: false,
        activePath: ''
      }
    },
    created() {
      this.activePath = window.sessionStorage.getItem('activePath')
      this.getIconObj()
      this.getMenuelist()
    },
    methods: {
      getIconObj () {
        this.$http.get('/onebook/icon/list?limit=1000')
          .then(({ data }) => {
            if (data && data.code === 0) {
              console.log(data)
              this.iconObj = data.page.list[0]
            } else {
              this.iconObj = []
            }
          })
      },
      getMenuelist () {
        this.$http.get('/onebook/menu/list?limit=1000')
          .then(({ data }) => {
            if (data && data.code === 0) {
              console.log(data)
              this.menuelist = data.page.list
            } else {
              this.menuelist = []
            }
          })
      },
      logout () {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      toggleCollapse () {
        this.isCollapse = !this.isCollapse
      },
      saveNavState (activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;

      span {
        margin-left: 25px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
