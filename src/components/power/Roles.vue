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
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="5">
          <el-select v-model="statusValue" placeholder="状态" clearable>
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable>
            <template slot="prepend">角色名称</template>
            <el-button slot="append" icon="el-icon-search" @click="getRolelist"></el-button>
          </el-input>
        </el-col>
        <!--添加角色按钮区-->
        <el-col :span="5"><el-button type="primary" @click="addEditDialog">添加角色</el-button></el-col>
      </el-row>
      <!--添加角色按钮区-->

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
        <el-table-column label="角色编号" prop="roleId"></el-table-column>
        <el-table-column label="角色名称" prop="name"></el-table-column>
        <el-table-column label="角色描述" prop="remake"></el-table-column>
        <el-table-column prop="status" label="状态">
          <!--scope作用域插槽,scope.row可获取整行的数据-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" prop="createTime"></el-table-column>
        <el-table-column label="更新日期" prop="updateTime"></el-table-column>
        <el-table-column label="创建/修改人员" prop="updateAccount"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row)">删除</el-button>
            <el-button type="success" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
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
    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="AddOrEditFormRules" ref="editFormRef">
        <el-form-item label="角色名称" prop="roleName" label-width="90px">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleRemake" label-width="90px">
          <el-input v-model="editForm.roleRemake"></el-input>
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
        <el-form-item label="角色描述" prop="roleRemake" label-width="90px">
          <el-input v-model="addForm.roleRemake"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="40%" @close="setRightDialogClosed">
      <!--树形控件-->
      <el-tree :data="menuelist" :props="treeProps" show-checkbox node-key="id"
               default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 保存一行的id，用于做编辑、删除、分配权限操作
        rowId: '',
        options: [{
          value: 1,
          label: '有效'
        }, {
          value: 0,
          label: '无效'
        }],
        statusValue: '',
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
        total: null,
        // 角色列表
        rolelist: [],
        // 权限列表
        menuelist: [],
        editForm: {},
        editDialogVisible: false,
        // 添加和修改表单的验证规则对象
        AddOrEditFormRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
          ],
          roleRemake: [
            { required: true, message: '请输入角色描述', trigger: 'blur' },
            { min: 4, max: 50, message: '长度在 4 到 50 个字符', trigger: 'blur' }
          ]
        },
        addDialogVisible: false,
        addForm: { roleName: '', roleRemake: '' },
        setRightDialogVisible: false,
        // 树形控件
        treeProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认选中的节点Id值数组
        defKeys: [],
        // 当前即将分配角色的id
        roleId: ''
      }
    },
    created () {
      this.getRolelist()
      this.getMenuelist()
    },
    methods: {
      getMenuelist () {
        this.$http.get(`/onebook/menu/treeList`)
          .then(({ data }) => {
            if (data && data.code === 0) {
              console.log(data)
              this.menuelist = data.page.list
              console.log(this.menuelist)
              this.total = data.page.totalCount
              this.queryInfo.pagesize = data.page.pageSize
              this.queryInfo.pagenum = data.page.currPage
            } else {
              this.menuelist = []
              this.total = 0
            }
          })
      },
      userStateChanged(userinfo) {
        this.$message.success(`更新用户状态成功!`)
      },
      getRolelist () {
        const params = new URLSearchParams()
        params.append('page', this.queryInfo.pagenum)
        params.append('limit', this.queryInfo.pagesize)
        params.append('status', this.statusValue)
        params.append('name', this.queryInfo.query)
        this.$http.post(`/onebook/role/treeList`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              console.log(data)
              this.rolelist = data.page.list
              this.total = data.page.totalCount
              this.queryInfo.pagesize = data.page.pageSize
              this.queryInfo.pagenum = data.page.currPage
            } else {
              this.rolelist = []
              this.total = 0
            }
          })
      },
      // 监听 pagesize 改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getRolelist()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getRolelist()
      },
      // 展示添加角色的对话框
      addEditDialog() {
        this.addDialogVisible = true
      },
      // 添加角色信息
      addRole() {
        this.$refs.addFormRef.validate(valid => {
          const params = new URLSearchParams()
          params.append('roleName', this.addForm.roleName)
          params.append('roleRemake', this.addForm.roleRemake)
          if (!valid) return
          this.$http.post(`/onebook/role/addRole`, params)
            .then(({ data }) => {
              console.log(2)
              if (data && data.code === 0) {
                this.getRolelist()
                // 关闭对话框
                this.addDialogVisible = false
                // 重置输入框的内容
                this.$refs.addFormRef.resetFields()
                // 提示修改成功
                this.$message.success(data.msg)
              } else {
                this.addDialogVisible = false
                this.$message.error(data.msg)
              }
            })
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
      removeRoleById(data) {
        this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const params = new URLSearchParams()
          params.append('roleId', data.roleId)
          this.$http.post(`/onebook/role/deleteByRoleId`, params)
            .then(({ data }) => {
              if (data && data.code === 0) {
                this.getRolelist()
                this.$message({
                  type: 'success',
                  message: data.msg
                })
              } else {
                this.$message({
                  type: 'info',
                  message: data.msg
                })
              }
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
      showSetRightDialog(data) {
        this.setRightDialogVisible = true
        this.rowId = data.roleId
      },
      // 监听分配权限对话框的关闭事件
      setRightDialogClosed() {
        this.defKeys = []
      },
      // 为角色分配权限
      allotRights() {
        this.setRightDialogVisible = false
        const params = new URLSearchParams()
        params.append('menuIds', this.$refs.treeRef.getCheckedKeys())
        params.append('roleId', this.rowId)
        this.$http.post(`/onebook/role/allotRights`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.getRolelist()
              this.defKeys = []
              // 提示修改成功
              this.$message.success(data.msg)
            } else {
              this.$message.error(data.msg)
            }
          })
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
