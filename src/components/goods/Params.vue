<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            :options="goodCatelist"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="parentCateChanged"
            placeholder="试试搜索：数一"
            clearable
            filterable>
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.parameterTagArray" :key="index" closable
                        @close="parameterClose(index,scope.row)">{{item}}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                          ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="parameterName"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit"
                           @click="showEditDialog(scope.row.parameterId)">
                  编辑
                </el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.parameterId)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.propertyTagArray" :key="index" closable
                        @close="propertyClose(index,scope.row)">{{item}}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                          ref="saveTagInput" size="small" @keyup.enter.native="propertyHandleInputConfirm(scope.row)"
                          @blur="propertyHandleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="propertyName"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.propertyId)">
                  编辑
                </el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.propertyId)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改动态参数/静态属性的对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加动态参数/静态属性的对话框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        disable: 'disable',
        // 商品分类列表
        goodCatelist: [],
        // 级联选择框的配置对象
        cateProps: {
          value: 'categoryId',
          label: 'categoryName',
          children: 'children'
        },
        // 级联选择框双向绑定到的数组
        selectedCateKeys: [],
        categoryId: '',
        // 被激活的页签的名称
        activeName: 'many',
        // 动态参数的数据
        manyTableData: [],
        // 静态属性的数据
        onlyTableData: [],
        // 控制添加对话框的显示与隐藏
        addDialogVisible: false,
        // 添加参数的表单数据对象
        addForm: {
          attr_name: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        },
        // 控制修改对话框的显示与隐藏
        editDialogVisible: false,
        // 修改的表单数据对象
        editForm: {
          attr_name: '',
          id: ''
        },
        // 修改表单的验证规则对象
        editFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getGoodCatelist()
    },
    methods: {
      // 获取商品分类列表
      getGoodCatelist() {
        const params = new URLSearchParams()
        this.$http.post(`/onebook/category/treeList`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.goodCatelist = data.page.records
            } else {
              this.goodCatelist = []
            }
          })
      },
      // 添加分类,选中父类的值
      parentCateChanged(data) {
        if (data.length === 3) {
          this.getParameters(data[data.length - 1])
          this.getPropertys(data[data.length - 1])
          this.categoryId = data[data.length - 1]
        }
      },
      // 查询动态参数
      getParameters(categoryId) {
        // 查询到动态参数和静态参数
        const params = new URLSearchParams()
        params.append('categoryId', categoryId)
        this.$http.post(`/onebook/parameter/list`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.manyTableData = data.data
            } else {
              this.manyTableData = []
            }
          })
      },
      // 查询静态参数
      getPropertys(categoryId) {
        // 查询到动态参数和静态参数
        const params = new URLSearchParams()
        params.append('categoryId', categoryId)
        this.$http.post(`/onebook/property/list`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.onlyTableData = data.data
            } else {
              this.onlyTableData = []
            }
          })
      },
      // 当标签被选中
      handleTabClick() {
      },
      // 监听添加对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加动态参数/静态属性
      addParams() {
        if (this.activeName === 'many') {
          this.$refs.addFormRef.validate(valid => {
            if (!valid) return
            const params = new URLSearchParams()
            params.append('categoryId', this.categoryId)
            params.append('parameterName', this.addForm.attr_name)
            this.$http.post(`/onebook/parameter/addParameter`, params)
              .then(({ data }) => {
                if (data && data.code === 0) {
                  this.getParameters(this.categoryId)
                  // 重置输入框的内容
                  this.$refs.addFormRef.resetFields()
                  this.addDialogVisible = false
                  this.$message.success(data.msg)
                } else {
                  this.$refs.addFormRef.resetFields()
                  this.addDialogVisible = false
                  this.$message.error(data.msg)
                }
              })
          })
        } else {
          this.$refs.addFormRef.validate(valid => {
            if (!valid) return
            const params = new URLSearchParams()
            params.append('categoryId', this.categoryId)
            params.append('propertyName', this.addForm.attr_name)
            this.$http.post(`/onebook/property/addProperty`, params)
              .then(({ data }) => {
                if (data && data.code === 0) {
                  this.getPropertys(this.categoryId)
                  // 重置输入框的内容
                  this.$refs.addFormRef.resetFields()
                  this.addDialogVisible = false
                  this.$message.success(data.msg)
                } else {
                  this.$refs.addFormRef.resetFields()
                  this.addDialogVisible = false
                  this.$message.error(data.msg)
                }
              })
          })
        }
      },
      // 点击按钮，展示修改的对话框
      showEditDialog(id) {
        this.editForm.id = id
        this.editDialogVisible = true
      },
      // 重置修改的表单
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，修改动态参数/静态属性信息
      editParams() {
        if (this.activeName === 'many') {
          this.$refs.editFormRef.validate(valid => {
            if (!valid) return
            const params = new URLSearchParams()
            params.append('parameterName', this.editForm.attr_name)
            params.append('parameterId', this.editForm.id)
            params.append('categoryId', this.categoryId)
            this.$http.post(`/onebook/parameter/updateParameter`, params)
              .then(({ data }) => {
                if (data && data.code === 0) {
                  this.getParameters(this.categoryId)
                  // 重置输入框的内容
                  this.$refs.editFormRef.resetFields()
                  this.editDialogVisible = false
                  this.$message.success(data.msg)
                } else {
                  this.$refs.editFormRef.resetFields()
                  this.editDialogVisible = false
                  this.$message.error(data.msg)
                }
              })
          })
        } else {
          this.$refs.editFormRef.validate(valid => {
            if (!valid) return
            const params = new URLSearchParams()
            params.append('propertyName', this.editForm.attr_name)
            params.append('propertyId', this.editForm.id)
            params.append('categoryId', this.categoryId)
            this.$http.post(`/onebook/property/updateProperty`, params)
              .then(({ data }) => {
                if (data && data.code === 0) {
                  this.getPropertys(this.categoryId)
                  // 重置输入框的内容
                  this.$refs.editFormRef.resetFields()
                  this.editDialogVisible = false
                  this.$message.success(data.msg)
                } else {
                  this.$refs.editFormRef.resetFields()
                  this.editDialogVisible = false
                  this.$message.error(data.msg)
                }
              })
          })
        }
      },
      // 根据Id删除对应的参数项
      removeParams(id) {
        this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.activeName === 'many') {
            const params = new URLSearchParams()
            params.append('parameterId', id)
            this.$http.post(`/onebook/parameter/deleteParameter`, params)
              .then(({ data }) => {
                if (data && data.code === 0) {
                  this.getParameters(this.categoryId)
                  // 重置输入框的内容
                  this.$message.success(data.msg)
                } else {
                  this.$message.error(data.msg)
                }
              })
          } else {
            const params = new URLSearchParams()
            params.append('propertyId', id)
            this.$http.post(`/onebook/property/deleteProperty`, params)
              .then(({ data }) => {
                if (data && data.code === 0) {
                  this.getPropertys(this.categoryId)
                  // 重置输入框的内容
                  this.$message.success(data.msg)
                } else {
                  this.$message.error(data.msg)
                }
              })
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 文本框失去焦点，或摁下了 Enter 都会触发
      handleInputConfirm(row) {
        if (row.inputValue === null || row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        if (row.parameterTagArray === null) {
          row.parameterTagArray = []
        }
        row.parameterTagArray.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveParameterTag(row, '添加成功')
      },
      // 文本框失去焦点，或摁下了 Enter 都会触发
      propertyHandleInputConfirm(row) {
        if (row.inputValue === null || row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        if (row.propertyTagArray === null) {
          row.propertyTagArray = []
        }
        row.propertyTagArray.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.savePropertyTag(row, '添加成功')
      },
      // 保存动态参数标签
      saveParameterTag(row, msg) {
        const params = new URLSearchParams()
        params.append('parameterId', row.parameterId)
        params.append('parameterName', row.parameterName)
        params.append('categoryId', row.categoryId)
        params.append('parameterTag', row.parameterTagArray.join(','))
        this.$http.post(`/onebook/parameter/updateTag`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.$message.success(msg)
            } else {
              this.$message.error(data.msg)
            }
          })
      },
      // 保存静态属性标签
      savePropertyTag(row, msg) {
        const params = new URLSearchParams()
        params.append('propertyId', row.propertyId)
        params.append('propertyName', row.propertyName)
        params.append('categoryId', row.categoryId)
        params.append('propertyTag', row.propertyTagArray.join(','))
        this.$http.post(`/onebook/property/updateTag`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.$message.success(msg)
            } else {
              this.$message.error(data.msg)
            }
          })
      },
      // 点击按钮，展示文本输入框
      showInput(row) {
        if (this.activeName !== 'many' && row.propertyTagArray.length === 1) {
          this.$message.error('只能添加一个tag')
          return
        }
        row.inputVisible = true
        // 让文本框自动获得焦点
        // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      // 删除动态参数可选项
      parameterClose(i, row) {
        row.parameterTagArray.splice(i, 1)
        this.saveParameterTag(row, '删除成功')
      },
      // 删除静态属性可选项
      propertyClose(i, row) {
        row.propertyTagArray.splice(i, 1)
        this.savePropertyTag(row, '删除成功')
      }
    },
    computed: {
      // 如果按钮需要被禁用，则返回true，否则返回false
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true
        }
        return false
      },
      // 动态计算标题的文本
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      }
    }
  }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 120px;
  }
</style>
