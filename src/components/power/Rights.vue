<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-table :data="menuelist" border stripe>
        <el-table-column label="编号" prop="menuId"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '1'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '2'">二级</el-tag>
            <el-tag type="warning" v-else-if="scope.row.level === '3'">三级</el-tag>
          </template>
        </el-table-column>
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
  </div>
</template>

<script>
  export default {
    data() {
      return {
        queryInfo: {
          // 输入框的信息
          query: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 10
        },
        // 总数据的数量
        total: null,
        // 权限列表
        menuelist: []
      }
    },
    created () {
      this.getMenuelist()
    },
    methods: {
      getMenuelist () {
        this.$http.get(`/onebook/menu/list?page=${this.queryInfo.pagenum}&limit=${this.queryInfo.pagesize}`)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.menuelist = data.page.list
              this.total = data.page.totalCount
              this.queryInfo.pagesize = data.page.pageSize
              this.queryInfo.pagenum = data.page.currPage
            } else {
              this.menuelist = []
              this.total = 0
            }
          })
      },
      // 监听 pagesize 改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getMenuelist()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getMenuelist()
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
