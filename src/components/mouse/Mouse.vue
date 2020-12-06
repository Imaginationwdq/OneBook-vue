<template>
  <el-card>
    <center style="margin-top: 50px">
      <el-row>
        <el-button round @click="clickNum('圆角按钮')">圆角按钮</el-button>
        <el-button type="primary" round @click="clickNum('主要按钮')">主要按钮</el-button>
        <el-button type="success" round @click="clickNum('成功按钮')">成功按钮</el-button>
        <el-button type="info" round @click="clickNum('信息按钮')">信息按钮</el-button>
        <el-button type="warning" round @click="clickNum('警告按钮')">警告按钮</el-button>
        <el-button type="danger" round @click="clickNum('危险按钮')">危险按钮</el-button>
      </el-row>
    </center>
    <!--角色列表-->
    <el-table :data="mouselist" border stripe>
      <!--索引列-->
      <el-table-column label="按钮名称" prop="name"></el-table-column>
      <el-table-column label="点击次数" prop="num"></el-table-column>
      <el-table-column label="日期" prop="time"></el-table-column>
    </el-table>
    <!--分页-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>
</template>

<script>
  export default {
    data() {
      return {
        mouselist: [],
        queryInfo: {
          // 输入框的信息
          query: '',
          // 输入框选项
          queryOpt: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 5
        },
        // 总数据的数量
        total: null
      }
    },
    // 此时，页面上的元素，已经被渲染完毕了！
    mounted() {
    },
    created() {
      this.getMouselist()
    },

    methods: {
      getMouselist () {
        this.$http.get(`/onebook/mouse/list?page=${this.queryInfo.pagenum}&limit=${this.queryInfo.pagesize}`)
          .then(({ data }) => {
            if (data && data.code === 0) {
              console.log(data)
              this.mouselist = data.page.list
              this.total = data.page.totalCount
              this.queryInfo.pagesize = data.page.pageSize
              this.queryInfo.pagenum = data.page.currPage
            } else {
              this.mouselist = []
              this.total = 0
            }
          })
      },
      clickNum (data) {
        const params = new URLSearchParams()
        params.append('clickName', data)
        this.$http.post(`/onebook/mouse/clickNum`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.getMouselist()
            } else {

            }
          })
      },
      // 监听 pagesize 改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getMouselist()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getMouselist()
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
