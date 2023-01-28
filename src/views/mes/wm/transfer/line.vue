<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-if="optType != 'view'"
          v-hasPermi="['mes:wm:transferline:add']"
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
          v-if="optType != 'view'"
          v-hasPermi="['mes:wm:transferline:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="transferlineList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />        
      <el-table-column label="产品物料编码" width="120px" align="center" prop="itemCode" />
      <el-table-column label="产品物料名称" width="150px" align="center" prop="itemName" />
      <el-table-column label="规格型号" align="center" prop="specification" />
      <el-table-column label="单位" align="center" prop="unitOfMeasure" />
      <el-table-column label="转移数量" align="center" prop="quantityTransfer" />
      <el-table-column label="生产工单" align="center" prop="workorderCode" />
      <el-table-column label="供应商编码" width="100px" align="center" prop="vendorCode" />      
      <el-table-column label="供应商简称" width="100px" align="center" prop="vendorNick" />      
      <el-table-column label="批次号" width="150px" align="center" prop="batchCode" />      
      <el-table-column label="移出仓库" align="center" prop="fromWarehouseName" />  
      <el-table-column label="移出库区" width="120px" align="center" prop="fromLocationName" />   
      <el-table-column label="移出库位" align="center" prop="fromAreaName" />   
      <el-table-column label="移入仓库" align="center" prop="toWarehouseName" />     
      <el-table-column label="移入库区" width="120px" align="center" prop="toLocationName" />  
      <el-table-column label="移入库位" align="center" prop="toAreaName" />
      <el-table-column label="操作" v-if="optType != 'view'" width="120px" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['mes:wm:transferline:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['mes:wm:transferline:remove']"
          >删除</el-button>
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

    <!-- 添加或修改转移单行对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">       
        <el-row>
          <el-col :span="8">
            <el-form-item label="产品物料" prop="itemCode">
              <el-input v-model="form.itemCode" placeholder="选择库存物资" >
                  <el-button slot="append" @click="handleSelectStock" icon="el-icon-search"></el-button>
              </el-input>
            </el-form-item>
            <StockSelect ref="stockSelect" :warehouseId="fromWarehouseId"  @onSelected="onStockSelected"></StockSelect>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品物料名称" prop="itemName">
              <el-input v-model="form.itemName" readonly="readonly" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单位" prop="unitOfMeasure">
              <el-input v-model="form.unitOfMeasure" readonly="readonly" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="规格型号" prop="specification">
              <el-input v-model="form.specification" type="textarea" readonly="readonly" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="批次号" prop="batchCode">
              <el-input v-model="form.batchCode" readonly="readonly" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="供应商名称" prop="vendorName">
              <el-input v-model="form.vendorName" readonly="readonly" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生产工单" prop="workorderCode">
              <el-input v-model="form.workorderCode" readonly="readonly" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="移出仓库" prop="fromWarehouse">
              <el-input v-model="fromWarehouse" readonly="readonly"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="移入仓库" prop="toWarehouseId">
              <el-cascader v-model="warehouseInfo"
                :options="warehouseOptions"
                :props="warehouseProps"
                @change="handleToWarehouseChanged"
              >                  
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="转移数量" prop="quantityTransfer">
              <el-input-number :min="0" :max="form.quantityMax" v-model="form.quantityTransfer" placeholder="请输入转移数量" />
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
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTransferline, getTransferline, delTransferline, addTransferline, updateTransferline } from "@/api/mes/wm/transferline";
import StockSelect from "@/components/stockSelect/single.vue"
import {getTreeList} from "@/api/mes/wm/warehouse"
export default {
  name: "Transferline",
  components: {
    StockSelect
  },
  props: {
    transferId: null,
    fromWarehouseId: null,
    toWarehouseId: null,
    optType: null,
  },
  data() {
    return {
      fromWarehouse: null,
      warehouseInfo:[],
      warehouseOptions:[],
      warehouseProps:{
        multiple: false,
        value: 'pId',
        label: 'pName',
      },
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
      // 转移单行表格数据
      transferlineList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        transferId: this.transferId,
        materialStockId: null,        
        itemId: null,        
        itemCode: null,        
        itemName: null,        
        specification: null,        
        unitOfMeasure: null,        
        quantityTransfer: null,  
        quantityMax: null,      
        workorderId: null,        
        workorderCode: null,        
        batchCode: null,        
        fromWarehouseId:null,        
        fromWarehouseCode: null,        
        fromWarehouseName: null,       
        fromLocationId: null,        
        fromLocationCode: null,        
        fromLocationName: null,        
        fromAreaId: null,        
        fromAreaCode: null,        
        fromAreaName: null,        
        toWarehouseId: null,        
        toWarehouseCode: null,       
        toWarehouseName: null,        
        toLocationId: null,        
        toLocationCode: null,        
        toLocationName: null,        
        toAreaId: null,        
        toAreaCode: null,        
        toAreaName: null,        
        expireDate: null,        
        vendorId: null,        
        vendorCode: null,        
        vendorName: null,        
        vendorNick: null,      
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        itemCode: [
          { required: true, message: "请选择移出的物资", trigger: "blur" }
        ],        
        toWarehouseId: [
          { required: true, message: "请指定移入仓库", trigger: "blur" }
        ],        
        quantityTransfer: [
          { required: true, message: "转移数量不能为空", trigger: "blur" }
        ],      }
    };
  },
  created() {
    this.getList();
    this.getWarehouseList();
  },
  methods: {
    /** 查询转移单行列表 */
    getList() {
      this.loading = true;
      listTransferline(this.queryParams).then(response => {
        this.transferlineList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getWarehouseList(){
      getTreeList().then( response =>{        
        this.warehouseOptions = response.data;
        this.warehouseOptions.map(w =>{
          w.children.map(l =>{
                  let lstr =JSON.stringify(l.children).replace(/locationId/g,'lId').replace(/areaId/g, 'pId').replace(/areaName/g,'pName');                  
                  l.children = JSON.parse(lstr);
          });
            
          let wstr = JSON.stringify(w.children).replace(/warehouseId/g,'wId').replace(/locationId/g, 'pId').replace(/locationName/g,'pName');  
          w.children =  JSON.parse(wstr); 

        });
        let ostr=JSON.stringify(this.warehouseOptions).replace(/warehouseId/g,'pId').replace(/warehouseName/g, 'pName');
        this.warehouseOptions = JSON.parse(ostr);
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
        lineId: null,        
        transferId: this.transferId,        
        materialStockId: null,        
        itemId: null,        
        itemCode: null,        
        itemName: null,        
        specification: null,        
        unitOfMeasure: null,        
        quantityTransfer: null,        
        workorderId: null,        
        workorderCode: null,        
        batchCode: null,        
        fromWarehouseId: this.fromWarehouseId,        
        fromWarehouseCode: null,        
        fromWarehouseName: null,        
        fromLocationId: null,        
        fromLocationCode: null,        
        fromLocationName: null,        
        fromAreaId: null,        
        fromAreaCode: null,        
        fromAreaName: null,        
        toWarehouseId: this.toWarehouseId,        
        toWarehouseCode: null,        
        toWarehouseName: null,        
        toLocationId: null,        
        toLocationCode: null,        
        toLocationName: null,        
        toAreaId: null,        
        toAreaCode: null,        
        toAreaName: null,        
        expireDate: null,        
        vendorId: null,        
        vendorCode: null,        
        vendorName: null,        
        vendorNick: null,        
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
      this.ids = selection.map(item => item.lineId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加转移单行";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const lineId = row.lineId || this.ids
      getTransferline(lineId).then(response => {
        this.form = response.data;
        this.fromWarehouse = response.data.fromWarehouseName+" / "+response.data.fromLocationName+" / "+response.data.fromAreaName;
        this.warehouseInfo[0] = response.data.toWarehouseId;    
        this.warehouseInfo[1] = response.data.toLocationId;    
        this.warehouseInfo[2] = response.data.toAreaId;
        this.open = true;
        this.title = "修改转移单行";
      });
    },
    /** 提交按钮 */
    submitForm() {
      debugger; 
      this.$refs["form"].validate(valid => {
        if (valid) {         

          if (this.form.lineId != null) {
            updateTransferline(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTransferline(this.form).then(response => {
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
      const lineIds = row.lineId || this.ids;
      this.$modal.confirm('是否确认删除转移单行编号为"' + lineIds + '"的数据项？').then(function() {
        return delTransferline(lineIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleSelectStock(){
      this.$refs.stockSelect.showFlag = true;
      this.$refs.stockSelect.getList();
    },
    //物料选择弹出框
    onStockSelected(obj){
      debugger;
        if(obj != undefined && obj != null){
          this.form.materialStockId = obj.materialStockId;
          this.form.itemId = obj.itemId;
          this.form.itemCode = obj.itemCode;
          this.form.itemName = obj.itemName;
          this.form.specification = obj.specification;
          this.form.unitOfMeasure = obj.unitOfMeasure;  
          this.form.batchCode = obj.batchCode;
          this.form.quantityTransfer = obj.quantityOnhand;
          this.form.quantityMax = obj.quantityOnhand;
          this.form.fromWarehouseId = obj.warehouseId;
          this.form.fromWarehouseCode = obj.warehouseCode;
          this.form.fromWarehouseName = obj.warehouseName;
          this.form.fromAreaId = obj.areaId;
          this.form.fromAreaCode = obj.areaCode;
          this.form.fromAreaName = obj.areaName;
          this.form.fromLocationId  = obj.locationId;
          this.form.fromLocationCode = obj.locationCode;
          this.form.fromLocationName = obj.locationName;
          this.form.vendorId = obj.vendorId;
          this.form.vendorCode = obj.vendorCode;
          this.form.vendorName = obj.vendorName;
          this.form.workorderId = obj.workorderId;
          this.form.workorderCode = obj.workorderCode; 
          this.fromWarehouse = obj.warehouseName +" / "+ obj.locationName +" / "+ obj.areaName;
        }
    },
    //选择默认的仓库、库区、库位
    handleToWarehouseChanged(obj){      
      if(obj !=null){
        this.form.toWarehouseId = obj[0];
        this.form.toLocationId = obj[1];
        this.form.toAreaId = obj[2];
      }
    },
  }
};
</script>
