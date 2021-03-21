<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!--步骤条-->
      <el-steps :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="动态参数"></el-step>
        <el-step title="静态属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--标签页-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="图书名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="图书作者" prop="goods_author">
              <el-input v-model="addForm.goods_author"></el-input>
            </el-form-item>
            <el-form-item label="图书售价" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="图书数量" prop="goods_num">
              <el-input v-model="addForm.goods_num" type="number"></el-input>
            </el-form-item>
            <el-form-item label="图书分类" prop="goods_cat">
              <el-cascader
                expand-trigger="options"
                :options="catelist"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="parentCateChanged"
                placeholder="试试搜索：数一"
                clearable
                filterable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.parameterName" v-for="item in manyTableData"
                          :key="item.parameterId">
              <el-checkbox-group v-model="item.parameterTagArray">
                <el-checkbox :label="cb" v-for="(cb,i) in item.parameterTagArray" :key="i" border>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.propertyName" v-for="item in onlyTableData"
                          :key="item.propertyId">
              <el-input v-model="item.propertyTag"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action: 图片要上传到的api地址 -->
            <el-upload
              class="upload-demo"
              :action="updateUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary" v-if="addForm.pics.length < 3">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">请上传三张图片，分别表示图书正面，反面，侧面</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 图片预览 -->
      <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
        <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        // 图片上传组件的请求头对象
        headerObj: {
          token: JSON.parse(localStorage.getItem('token'))
        },
        activeIndex: '0',
        // 添加商品的表单数据对象
        addForm: {
          goods_name: '',
          goods_author: '',
          goods_price: '',
          goods_num: 1,
          // 商品所属的分类数组
          goods_cat: [],
          // 图书描述
          goods_introduce: '',
          // 照片
          pics: []
        },
        addFormRules: {
          goods_name: [
            { required: true, message: '请输入图书名称', trigger: 'blur' }
          ],
          goods_author: [
            { required: true, message: '请输入图书原价', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入图书售价', trigger: 'blur' }
          ],
          goods_num: [
            { required: true, message: '请选择图书新旧程度', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请选择图书分类', trigger: 'blur' }
          ]
        },
        // 商品分类列表
        catelist: [],
        cateProps: {
          value: 'categoryId',
          label: 'categoryName',
          children: 'children'
        },
        // 预览图片的地址
        previewPath: '',
        // 预览图片的开关
        previewVisible: false,
        // 动态参数列表数据
        manyTableData: [],
        // 静态属性列表数据
        onlyTableData: [],
        // 上传图片的url地址
        updateUrl: 'http://localhost:8090/onebook/bookdetail/uploade'
      }
    },
    created() {
      this.getCatelist()
    },
    methods: {
      // 监听图片上传成功后
      handleSuccess(data) {
        this.addForm.pics.push(data.url)
      },
      beforeTabLeave(activeName, oldActiveName) {
        // console.log('即将离开的标签页名字是：' + oldActiveName)
        // console.log('即将进入的标签页名字是：' + activeName)
        // return false
        if (oldActiveName === '0' && this.addForm.goods_cat.length < 3) {
          this.$message.error('请先选择商品3级分类！')
          return false
        }
        if (activeName === '3' || oldActiveName === '4') {
          if (this.manyTableData.length === 0) {
            this.$message.error('请先编辑动态参数！')
            return false
          }
          if (this.onlyTableData.length === 0) {
            this.$message.error('请先编辑静态属性！')
            return false
          }
        }
      },
      // 处理移除图片的操作
      handleRemove(file) {
        const filePath = file.response.url
        const i = this.addForm.pics.findIndex(x => x === filePath)
        this.addForm.pics.splice(i, 1)
      },
      // 处理图片预览效果
      handlePreview(file) {
        this.previewPath = file.url
        this.previewVisible = true
      },
      // 添加商品
      add() {
        this.$refs.addFormRef.validate(valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项！')
          }
          if (this.addForm.pics.length !== 3) {
            return this.$message.error('请上传三张图片')
          }
          const cat = this.addForm.goods_cat.join(',')
          const pics = this.addForm.pics.join(',')
          // 处理动态参数和静态属性
          const parameter = []
          const property = []
          this.manyTableData.forEach(item => {
            const newInfo = []
            newInfo.push(item.parameterId)
            newInfo.push(item.parameterTagArray.join(','))
            parameter.push(newInfo.join('-9wdqnb9-'))
          })
          this.onlyTableData.forEach(item => {
            const newInfo = []
            newInfo.push(item.propertyId)
            newInfo.push(item.propertyTag)
            property.push(newInfo.join('-9wdqnb9-'))
          })
          const params = new URLSearchParams()
          params.append('categoryId', cat)
          params.append('title', this.addForm.goods_name)
          params.append('author', this.addForm.goods_author)
          params.append('price', this.addForm.goods_price)
          params.append('remake', this.addForm.goods_introduce)
          params.append('pics', pics)
          params.append('num', this.addForm.goods_num)
          params.append('parameter', parameter.join('-wdqnb-'))
          params.append('property', property.join('-wdqnb-'))
          this.$http.post(`/onebook/bookdetail/addBook`, params)
            .then(({ data }) => {
              if (data && data.code === 0) {
                this.$message.success(data.msg)
                this.$router.push('/goods')
              } else {
                this.$message.error(data.msg)
              }
            })
        })
      },
      // 获取商品分类列表
      getCatelist() {
        const params = new URLSearchParams()
        this.$http.post(`/onebook/category/treeList`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.catelist = data.page.records
            } else {
              this.catelist = []
            }
          })
      },
      // 添加分类,选中父类的值
      parentCateChanged(data) {
      },
      tabClicked() {
        // console.log(this.activeIndex)
        if (this.activeIndex === '1') {
          // 动态参数面板
          this.getParameters(this.cateId)
        } else if (this.activeIndex === '2') {
          // 静态属性面板
          this.getPropertys(this.cateId)
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
      }
    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .btnAdd {
    margin-top: 15px;
  }
</style>
