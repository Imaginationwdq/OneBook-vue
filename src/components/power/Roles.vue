<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!--添加角色按钮区-->
      <el-row><el-col><el-button type="primary" @click="addEditDialog">添加角色</el-button></el-col></el-row>
      <!--角色列表-->
      <el-table :data="rolelist" border stripe>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="i1"
            :class="['bdbottom', i1 ===0 ? 'bdtop' : '', 'vcenter']">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById()">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级权限-->
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="i2">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById()">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="i3" closable @close="removeRightById()">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row)">删除</el-button>
            <el-button type="success" icon="el-icon-setting" size="mini" @click="showSetRightDialog()">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="AddOrEditFormRules" ref="editFormRef">
        <el-form-item label="角色名称" prop="roleName" label-width="90px">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="90px">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="AddOrEditFormRules" ref="addFormRef">
        <el-form-item label="角色名称" prop="roleName" label-width="90px">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="90px">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="40%" @close="setRightDialogClosed">
      <!--树形控件-->
      <el-tree :data="rightlist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 角色列表
        rolelist: [
          { id: '', roleName: '主管', roleDesc: '技术负责人', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [] }, { id: '101', authName: '商品列表', path: 'goods', children: [] }, { id: '101', authName: '商品列表', path: 'goods', children: [] }] }, { id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [] }] }] }, { id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [] }] }] }] },
          { id: '', roleName: '测试角色', roleDesc: '测试角色描述', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [] }] }] }, { id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [] }] }] }] },
          { id: '', roleName: 'test', roleDesc: 'test', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [] }] }] }, { id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [{ id: '101', authName: '商品列表', path: 'goods', children: [] }] }] }] }
        ],
        // 权限列表
        rightlist: [
          { id: '1', authName: '商品管理', path: 'goods', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] },
          { id: '2', authName: '订单管理', path: 'orders', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] },
          { id: '3', authName: '权限管理', path: 'rights', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] },
          { id: '4', authName: '商品列表', path: 'goods', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] },
          { id: '5', authName: '添加商品', path: 'goods', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] },
          { id: '6', authName: '订单列表', path: 'rights', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [{ id: '1', authName: '商品管理', path: 'goods', children: [] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] }, { id: '1', authName: '商品管理', path: 'goods', children: [] }] }
        ],
        editForm: {},
        editDialogVisible: false,
        // 添加和修改表单的验证规则对象
        AddOrEditFormRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' },
            { min: 5, max: 50, message: '长度在 5 到 50 个字符', trigger: 'blur' }
          ]
        },
        addDialogVisible: false,
        addForm: { roleName: '', roleDesc: '' },
        setRightDialogVisible: false,
        // 树形控件
        treeProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认选中的节点Id值数组
        defKeys: [2, 3],
        // 当前即将分配角色的id
        roleId: ''
      }
    },
    created () {

    },
    methods: {
      // 展示添加角色的对话框
      addEditDialog() {
        this.addDialogVisible = true
      },
      // 监听添加角色对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 修改角色信息并提交
      addRoleInfo() {
        this.$refs.addFormRef.validate(valid => {
          if (!valid) return
          // 关闭对话框
          this.addDialogVisible = false
          // 提示修改成功
          this.$message.success('增加角色信息成功！')
        })
      },
      // 展示编辑角色的对话框
      showEditDialog(row) {
        const Eform = { roleName: row.roleName, roleDesc: row.roleDesc }
        this.editForm = Eform
        this.editDialogVisible = true
      },
      // 监听修改角色对话框的关闭事件
      editDialogClosed() {
        // this.$refs.editFormRef.resetFields()
      },
      // 修改角色信息并提交
      editRoleInfo() {
        this.$refs.editFormRef.validate(valid => {
          if (!valid) return
          // 关闭对话框
          this.editDialogVisible = false
          // 提示修改成功
          this.$message.success('更新角色信息成功！')
        })
      },
      // 根据Id删除角色
      removeRoleById() {
        this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 根据Id删除权限
      removeRightById() {
        // 弹框提示用户是否要删除
        this.$confirm('此操作将永久删除该权限标签, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 展示分配权限的对话框
      showSetRightDialog() {
        this.setRightDialogVisible = true
      },
      // 监听分配权限对话框的关闭事件
      setRightDialogClosed() {
        this.defKeys = []
      },
      // 为角色分配权限
      allotRights() {
        this.setRightDialogVisible = false
        // 提示修改成功
        this.$message.success('权限分配修改成功！')
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  /*上面画线*/
  .bdtop {
    border-top: 1px solid #eee;
  }
  /*下面画线*/
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  /*竖直居中*/
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
