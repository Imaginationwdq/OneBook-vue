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
      <el-table :data="rightlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else-if="scope.row.level === '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 权限列表
        rightlist: [
          { id: '', authName: '商品管理', level: '0', pid: '', path: 'goods' },
          { id: '', authName: '订单管理', level: '0', pid: '', path: 'orders' },
          { id: '', authName: '权限管理', level: '0', pid: '', path: 'rights' },
          { id: '', authName: '商品列表', level: '1', pid: '', path: 'goods' },
          { id: '', authName: '添加商品', level: '2', pid: '', path: 'goods' },
          { id: '', authName: '订单列表', level: '1', pid: '', path: 'rights' }
        ]
      }
    },
    created () {

    },
    methods: {

    }
  }
</script>

<style lang="less" scoped>

</style>
