<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="3">
          <el-select v-model="statusValue" placeholder="状态" clearable>
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-input v-model="queryInfo.queryUsername" placeholder="请输入内容" clearable>
            <template slot="prepend">账号</template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-input v-model="queryInfo.queryRoleName" placeholder="请输入内容" clearable>
            <template slot="prepend">角色名称</template>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" :offset="6">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="selection" header-align="center" align="center"></el-table-column>
        <el-table-column fixed prop="userId" label="编号" header-align="center" align="center"></el-table-column>
        <el-table-column fixed prop="username" label="账号" header-align="center" align="center"></el-table-column>
        <el-table-column prop="password" label="密码" header-align="center" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" header-align="center" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色" header-align="center" align="center"></el-table-column>
        <el-table-column prop="status" header-align="center" align="center" label="状态">
          <!--scope作用域插槽,scope.row可获取整行的数据-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" header-align="center" align="center"></el-table-column>
        <el-table-column prop="sex" label="性别" header-align="center" align="center"></el-table-column>
        <el-table-column prop="birthday" label="出生日期" width="120" header-align="center" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建日期" width="170" header-align="center" align="center"></el-table-column>
        <el-table-column prop="updateTime" label="更新日期" width="170" header-align="center" align="center"></el-table-column>
        <el-table-column prop="updateAccount" label="更新账号" width="120" header-align="center" align="center"></el-table-column>
        <el-table-column label="操作" width="120px" fixed="right" header-align="center" align="center">
          <template slot-scope="scope">
            <template>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row)"></el-button>
            </template>
            <el-tooltip effect="dark" content="修改权限" placement="top-start" :enterable="false">
              <el-button type="success" icon="el-icon-check" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 25]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--添加用户对话框-->
    <el-dialog
      title="添加用户信息"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="dialogVisible"
      @close="addDialogClosed">
      <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="addForm.roleId" placeholder="请选择" clearable>
            <el-option v-for="item in rolesList" :key="item.roleId" :label="item.name" :value="item.roleId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.roleName}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.roleId" :label="item.name" :value="item.roleId">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo(userInfo.userId)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        // 输入框的信息
        queryUsername: '',
        queryRoleName: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      options: [{
        value: 1,
        label: '有效'
      }, {
        value: 0,
        label: '无效'
      }],
      statusValue: '',
      // 总数据的数量
      total: null,
      userlist: [],
      // 控制添加用户对话框
      dialogVisible: false,
      addForm: {
        username: '',
        password: '',
        name: '',
        roleId: 8
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 20,
            message: '用户名的长度在3~20个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 16,
            message: '用户名的长度在6~16个字符之间',
            trigger: 'blur'
          }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          {
            min: 1,
            max: 16,
            message: '姓名的长度在1~16个字符之间',
            trigger: 'blur'
          }
        ],
        roleId: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
    this.getRolelist()
  },
  methods: {
    // 获取用户列表
    getUserList () {
      const params = new URLSearchParams()
      params.append('page', this.queryInfo.pagenum)
      params.append('limit', this.queryInfo.pagesize)
      params.append('status', this.statusValue)
      params.append('roleName', this.queryInfo.queryRoleName)
      params.append('username', this.queryInfo.queryUsername)
      this.$http.post(`/onebook/users/list`, params)
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.userlist = data.page.list
            this.total = Number(data.page.totalCount)
            this.queryInfo.pagesize = Number(data.page.pageSize)
            this.queryInfo.pagenum = Number(data.page.currPage)
          } else {
            this.userlist = []
            this.total = 0
          }
        })
    },
    // 获取角色列表
    getRolelist () {
      const params = new URLSearchParams()
      params.append('status', "1")
      this.$http.post(`/onebook/role/treeList`, params)
        .then(({ data }) => {
          if (data && data.code === 0) {
            console.log(data)
            this.rolesList = data.page.list
          } else {
            this.rolesList = []
          }
        })
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
    },
    // 修改用户状态
    userStateChanged(userinfo) {
      const params = new URLSearchParams()
      params.append('userId', userinfo.userId)
      params.append('status', userinfo.status)
      this.$http.post(`/onebook/users/updateStatusByUserId`, params)
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.getUserList()
            this.$message.success(data.msg)
          } else {
            this.$message.error(data.msg)
          }
        })
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        const params = new URLSearchParams()
        params.append('username', this.addForm.username)
        params.append('password', this.addForm.password)
        params.append('name', this.addForm.name)
        params.append('roleId', this.addForm.roleId)
        if (!valid) return
        this.$http.post(`/onebook/users/addUser`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.getUserList()
              // 关闭对话框
              this.dialogVisible = false
              // 重置输入框的内容
              this.$refs.addFormRef.resetFields()
              // 提示修改成功
              this.$message.success(data.msg)
            } else {
              this.dialogVisible = false
              this.$message.error(data.msg)
            }
          })
      })
    },
    // 删除用户
    removeUserById(user) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams()
        params.append('userId', user.userId)
        this.$http.post(`/onebook/users/deleteByUserId`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.getUserList()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message({
                type: 'info',
                message: '已取消删除'
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
    // 展示分配角色的对话框
    setRole(userInfo) {
      this.userInfo = { username: userInfo.username, roleName: userInfo.roleName, userId: userInfo.userId }
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    saveRoleInfo(userId) {
      const params = new URLSearchParams()
      params.append('userId', userId)
      params.append('roleId', this.selectedRoleId)
      this.$http.post(`/onebook/users/updateRoleByUserId`, params)
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.getUserList()
            this.setRoleDialogVisible = false
            this.$message.success(data.msg)
          } else {
            this.setRoleDialogVisible = false
            this.$message.error(data.msg)
          }
        })
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>
