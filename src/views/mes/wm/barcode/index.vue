<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="条码类型" prop="barcodeType">
        <el-select v-model="queryParams.barcodeType" placeholder="请选择条码类型">
          <el-option
            v-for="dict in dict.type.mes_barcode_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="业务编码" prop="bussinessCode">
        <el-input
          v-model="queryParams.bussinessCode"
          placeholder="请输入业务编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="业务名称" prop="bussinessName">
        <el-input
          v-model="queryParams.bussinessName"
          placeholder="请输入业务名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['mes:wm:barcode:add']"
        >新增</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['mes:wm:barcode:remove']"
        >删除</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-s-tools"
          size="mini"
          @click="handleConfig"
          v-hasPermi="['mes:wm:barcode:edit']"
        >条码设置</el-button>
      </el-col>
      <Barcodeconfig ref="barcodeconfig"></Barcodeconfig>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="barcodeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />     
      <el-table-column label="条码" align="center">
        <template slot-scope="scope">
            <el-image @click="handleView(scope.row)" class="barcodeClass" fit="scale-down" :src="scope.row.barcodeUrl">
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
        </template>
      </el-table-column> 
      <el-table-column label="条码格式" align="center" prop="barcodeFormart">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.mes_barcode_formart" :value="scope.row.barcodeFormart"/>
        </template>
      </el-table-column>          
      <el-table-column label="条码类型" align="center" prop="barcodeType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.mes_barcode_type" :value="scope.row.barcodeType"/>
        </template>
      </el-table-column>
      <el-table-column label="条码内容" align="center" prop="barcodeContent" />
      <el-table-column label="业务编码" align="center" prop="bussinessCode" />
      <el-table-column label="业务名称" align="center" prop="bussinessName" />
      <el-table-column label="是否生效" align="center" prop="enableFlag" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_yes_no" :value="scope.row.enableFlag"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['mes:wm:barcode:edit']"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['mes:wm:barcode:remove']"
          >打印</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改条码清单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="条码格式" prop="barcodeFormart">          
              <el-select v-model="form.barcodeFormart" placeholder="请选择条码格式">
                <el-option
                  v-for="dict in dict.type.mes_barcode_formart"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="条码类型" prop="barcodeType">
              <el-select v-model="form.barcodeType" placeholder="请选择条码类型">
                <el-option
                  v-for="dict in dict.type.mes_barcode_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否启用">
              <el-radio-group v-model="form.enableFlag" disabled v-if="optType=='view'">
                <el-radio
                  v-for="dict in dict.type.sys_yes_no"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
              <el-radio-group v-model="form.enableFlag" v-else>
                <el-radio
                  v-for="dict in dict.type.sys_yes_no"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <!--根据不同的条码类型展示不同的业务内容选择 start-->
        <!--物料产品-->
        <el-row v-if="form.barcodeType=='ITEM'">
          <el-col :span="12">
            <el-form-item label="物料编码"  prop="bussinessCode">
              <el-input v-model="form.bussinessCode" readonly="readonly" placeholder="请选择物料编码" >
                <el-button slot="append" @click="handleSelectProduct" icon="el-icon-search"></el-button>
              </el-input>
            </el-form-item>
            <ItemSelect ref="itemSelect" @onSelected="onItemSelected" > </ItemSelect>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料名称" prop="bussinessName">
              <el-input v-model="form.bussinessName" readonly="readonly" />
            </el-form-item>
          </el-col>
        </el-row>
        <!--箱条码-->
        <el-row v-if="form.barcodeType=='BOX'">
          <el-col :span="12">
            <el-form-item label="装箱单号"  prop="packageCode">
              <el-input v-model="form.bussinessCode" readonly="readonly" placeholder="请选择装箱单" >
                <el-button slot="append" @click="handleSelectPackage" icon="el-icon-search"></el-button>
              </el-input>
            </el-form-item>
            <PackageSelectSingle ref="packageSelect" :status="'FINISHED'" @onSelected="onPackageSelected"></PackageSelectSingle>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="bussinessName">
              <el-input v-model="form.bussinessName" readonly="readonly" />
            </el-form-item>
          </el-col>
        </el-row>
        <!--供应商-->
        <el-row v-else-if="form.barcodeType=='VENDOR'">
          <el-col :span="12">
            <el-form-item label="供应商编号" prop="bussinessCode">
              <el-input v-model="form.bussinessCode" readonly="readonly" placeholder="请选择供应商" >
                <el-button slot="append" @click="handleSelectVendor" icon="el-icon-search"></el-button>
              </el-input>
              <VendorSelect ref="vendorSelect" @onSelected="onVendorSelected" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商名称" prop="bussinessName">
              <el-input v-model="form.bussinessName" readonly="readonly" >
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!--根据不同的条码类型展示不同的业务内容选择 end-->
        <el-row>
          <el-col :span="24">
            <el-form-item label="条码内容">
              <el-input v-model="form.barcodeContent" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="条码" prop="url">
              <el-image class="barcodeFormClass" :src="form.barcodeUrl">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>   
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel" v-if="optType =='view'">返回</el-button>
        <el-button type="primary" @click="submitForm" v-if="optType !='view' ">保 存</el-button>        
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listBarcode, getBarcode, delBarcode, addBarcode, updateBarcode } from "@/api/mes/wm/barcode";
import ItemSelect  from "@/components/itemSelect/single.vue";
import VendorSelect from "@/components/vendorSelect/single.vue";
import PackageSelectSingle from "@/components/package/single.vue";
import Barcodeconfig from "./config.vue"
export default {
  name: "Barcode",
  dicts: ['mes_barcode_type','mes_barcode_formart','sys_yes_no'],
  components: {
    ItemSelect,VendorSelect,PackageSelectSingle,Barcodeconfig
  },
  data() {
    return {
      optType: null,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 条码清单表格数据
      barcodeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        barcodeFormart: null,
        barcodeType: null,
        barcodeContent: null,
        bussinessId: null,
        bussinessCode: null,
        bussinessName: null,
        barcodeUrl: null,
        enableFlag: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        barcodeFormart: [
          { required: true, message: "条码格式不能为空", trigger: "blur" }
        ],
        barcodeType: [
          { required: true, message: "条码类型不能为空", trigger: "change" }
        ],
        barcodeContent: [
          { required: true, message: "产品物料ID不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询条码清单列表 */
    getList() {
      this.loading = true;
      listBarcode(this.queryParams).then(response => {
        this.barcodeList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        barcodeId: null,
        barcodeFormart: null,
        barcodeType: null,
        barcodeContent: null,
        bussinessId: null,
        bussinessCode: null,
        bussinessName: null,
        barcodeUrl: null,
        enableFlag: 'Y',
        remark: null,
        attr1: null,
        attr2: null,
        attr3: null,
        attr4: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.barcodeId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加条码";
      this.optType = "add";
    },
    handleView(row){
      this.reset();
      const barcodeId = row.barcodeId
      getBarcode(barcodeId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "查看条码";
        this.optType = "view";
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const barcodeId = row.barcodeId || this.ids
      getBarcode(barcodeId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改条码";
        this.optType = "edit";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.barcodeId != null) {
            updateBarcode(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBarcode(this.form).then(response => {
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
      const barcodeIds = row.barcodeId || this.ids;
      this.$modal.confirm('是否确认删除条码清单编号为"' + barcodeIds + '"的数据项？').then(function() {
        return delBarcode(barcodeIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wm/barcode/export', {
        ...this.queryParams
      }, `barcode_${new Date().getTime()}.xlsx`)
    },
    //物料选择
    handleSelectProduct(){
      this.$refs.itemSelect.showFlag = true;
    },
    //物料选择弹出框
    onItemSelected(obj){
        if(obj != undefined && obj != null){
          this.form.bussinessId = obj.itemId;
          this.form.bussinessCode = obj.itemCode;
          this.form.bussinessName = obj.itemName;
          this.form.barcodeContent= "".concat(this.form.barcodeType,'-',this.form.bussinessCode);
        }
    },
    //装箱单选择
    handleSelectPackage(){
      this.$refs.packageSelect.showFlag=true;
    },
    /**选择装箱单返回 */
    onPackageSelected(obj){
      if(obj != undefined && obj != null){
          this.form.bussinessId = obj.packageId;
          this.form.bussinessCode = obj.packageCode;
          this.form.bussinessName = obj.clientName;
          this.form.barcodeContent= "".concat(this.form.barcodeType,'-',this.form.bussinessCode);
        }
    },
    handleConfig(){
      this.$refs.barcodeconfig.showFlag = true;
    }
  }
};
</script>
<style scoped>
  .barcodeClass {
    width: 100px;
    height: 200px;
  }
  .barcodeFormClass {
    width: 200px;
    height: 200px;
  }

</style>
