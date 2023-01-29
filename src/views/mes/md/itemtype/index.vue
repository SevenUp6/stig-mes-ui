<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="分类名称" prop="itemTypeName">
        <el-input
          v-model="queryParams.itemTypeName"
          placeholder="请输入分类名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否启用" prop="enableFlag">
        <el-select v-model="queryParams.enableFlag" placeholder="选择是或否" clearable>
          <el-option
            v-for="dict in dict.type.sys_yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="info"-->
<!--          plain-->
<!--          icon="el-icon-upload2"-->
<!--          size="mini"-->
<!--          @click="handleImport"-->
<!--          v-hasPermi="['mes:md:itemtype:import']"-->
<!--        >导入</el-button>-->
<!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="itemTypeList"
      row-key="itemTypeId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="itemTypeName" label="分类" width="260"></el-table-column>
      <el-table-column prop="orderNum" label="排序" width="200"></el-table-column>
<!--      <el-table-column prop="itemOrProduct" label="物料/产品" width="200">-->
<!--        <template slot-scope="scope">-->
<!--          <dict-tag :options="dict.type.mes_item_product" :value="scope.row.itemOrProduct"/>-->
<!--        </template>-->
<!--      </el-table-column>-->

      <el-table-column prop="enableFlag" label="是否启用" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_yes_no" :value="scope.row.enableFlag"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['mes:md:itemtype:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['mes:md:itemtype:add']"
          >新增</el-button>
          <el-button
            v-if="scope.row.parentTypeId != 0"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['mes:md:itemtype:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改物料分类对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.parentTypeId !== 0">
            <el-form-item label="父分类" prop="parentTypeId">
              <treeselect v-model="form.parentTypeId" disabled = "disabled" :options="itemTypeOptions" :normalizer="normalizer" placeholder="请选择上级分类" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="分类名称" prop="itemTypeName">
              <el-input v-model="form.itemTypeName" placeholder="请输入分类名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
<!--          <el-col :span="12">-->
<!--            <el-form-item label="物料/产品">-->
<!--              <el-radio-group v-model="form.itemOrProduct">-->
<!--                <el-radio-->
<!--                  v-for="dict in dict.type.mes_item_product"-->
<!--                  :key="dict.value"-->
<!--                  :label="dict.value"-->
<!--                >{{dict.label}}</el-radio>-->
<!--              </el-radio-group>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-radio-group v-model="form.enableFlag">
                <el-radio
                  v-for="dict in dict.type.sys_yes_no"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 物料导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listItemType, getItemType, delItemType, addItemType, updateItemType, listItemTypeExcludeChild } from "@/api/mes/md/itemtype";
import { getToken } from "@/utils/auth";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "ItemType",
  dicts: ['sys_yes_no','mes_item_product'],
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      itemTypeList: [],
      // 部门树选项
      itemTypeOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        itemTypeName: undefined,
        enableFlag: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        parentTypeId: [
          { required: true, message: "父分类不能为空", trigger: "blur" }
        ],
        itemTypeName: [
          { required: true, message: "分类名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "显示排序不能为空", trigger: "blur" }
        ],
        itemOrProduct: [
          {
            required: false,
            message: "请选择是产品分类还是物料分类",
            trigger: ["blur"]
          }
        ]
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/mes/md/mditem/importData"
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询部门列表 */
    getList() {
      this.loading = true;
      listItemType(this.queryParams).then(response => {
        var types = this.handleTree(response.data, "itemTypeId","parentTypeId");
        this.itemTypeList = types;
        this.loading = false;
      });
    },
    /** 转换部门数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.itemTypeId,
        label: node.itemTypeName,
        children: node.children
      };
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        itemTypeId: undefined,
        parentTypeId: undefined,
        itemTypeCode: undefined,
        itemTypeName: undefined,
        orderNum: undefined,
        itemOrProduct: undefined,
        enableFlag: 'Y'
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      if (row != undefined) {
        this.form.parentTypeId = row.itemTypeId;
      }
      this.open = true;
      this.title = "添加分类";
      listItemType().then(response => {
        this.itemTypeOptions = this.handleTree(response.data, "itemTypeId","parentTypeId");
      });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "物料/产品导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download('mes/md/mditem/importTemplate', {
      }, `md_item_${new Date().getTime()}.xlsx`)
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    submitFileForm() {
      this.$refs.upload.submit();
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getItemType(row.itemTypeId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改分类";
      });
      listItemTypeExcludeChild(row.itemTypeId).then(response => {
        this.itemTypeOptions = this.handleTree(response.data, "itemTypeId","parentTypeId");
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.itemTypeId != undefined) {
            updateItemType(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addItemType(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$modal.confirm('是否确认删除名称为"' + row.itemTypeName + '"的分类？').then(function() {
        return delItemType(row.itemTypeId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
