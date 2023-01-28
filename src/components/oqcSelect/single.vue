<template>
    <el-dialog title="客户选择"
    v-if="showFlag"
    :visible.sync="showFlag"
    :modal= false
    width="80%"
    center
    >
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
        <el-form-item label="检验单编号" prop="oqcCode">
          <el-input
            v-model="queryParams.oqcCode"
            placeholder="请输入出货检验单编号"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="客户名称" prop="clientName">
          <el-input
            v-model="queryParams.clientName"
            placeholder="请输入客户名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="批次号" prop="batchCode">
          <el-input
            v-model="queryParams.batchCode"
            placeholder="请输入批次号"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="产品物料编码" prop="itemCode">
          <el-input
            v-model="queryParams.itemCode"
            placeholder="请输入产品物料编码"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="产品物料名称" prop="itemName">
          <el-input
            v-model="queryParams.itemName"
            placeholder="请输入产品物料名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="检测结果" prop="checkResult">
          <el-select v-model="queryParams.checkResult" placeholder="请选择检测结果">
              <el-option
                v-for="dict in dict.type.mes_qc_result"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
  
      <el-table v-loading="loading" :data="oqcList" @current-change="handleCurrent" @row-dblclick="handleRowDbClick">
        <el-table-column width="50" align="center" >
            <template v-slot="scope">
                <el-radio v-model="selectedId" :label="scope.row.oqcId" @change="handleRowChange(scope.row)">{{""}}</el-radio>
            </template>
        </el-table-column>      
        <el-table-column label="出货检验单编号" width="150px" align="center" prop="oqcCode" >
        </el-table-column>      
        <el-table-column label="验单名称" width="100px" align="center" prop="oqcName" :show-overflow-tooltip="true"/>
     
        <el-table-column label="客户名称" width="100px" align="center" prop="clientName" :show-overflow-tooltip="true"/>
        <el-table-column label="批次号" align="center" prop="batchCode" />
        
        <el-table-column label="产品编码" width="120px" align="center" prop="itemCode" />
        <el-table-column label="产品名称" align="center" prop="itemName" :show-overflow-tooltip="true"/>
        <el-table-column label="规格型号" align="center" prop="specification" :show-overflow-tooltip="true"/>
        <el-table-column label="单位" align="center" prop="unitOfMeasure" />
       
        <el-table-column label="发货数量" align="center" prop="quantityOut" />
        <el-table-column label="检测数量" align="center" prop="quantityCheck" />
        <el-table-column label="不合格数" align="center" prop="quantityUnqualified" />
    
        <el-table-column label="检测结果" align="center" prop="checkResult" >
          <template slot-scope="scope">
            <dict-tag :options="dict.type.mes_qc_result" :value="scope.row.checkResult"/>
          </template>
        </el-table-column>
        <el-table-column label="检测日期" align="center" prop="inspectDate" width="120">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.inspectDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="检测人员" align="center" prop="inspector" />
        <el-table-column label="单据状态" align="center" prop="status" >
          <template slot-scope="scope">
            <dict-tag :options="dict.type.mes_order_status" :value="scope.row.status"/>
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
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmSelect">确 定</el-button>
        <el-button @click="showFlag=false">取 消</el-button>
      </div>
    </el-dialog>
  </template>
  
  <script>
  import { listOqc} from "@/api/mes/qc/oqc";
  export default {
    name: "OqcSelectSingle",
    dicts: ['mes_order_status','mes_qc_result'],
    data() {
      return {
        showFlag:false,
        // 遮罩层
        loading: true,
        // 选中
        selectedId: null,
        selectedRow: undefined,
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 出货检验单表格数据
        oqcList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          oqcCode: null,
          oqcName: null,
          templateId: null,
          clientId: null,
          clientCode: null,
          clientName: null,
          batchCode: null,
          itemId: null,
          itemCode: null,
          itemName: null,
          specification: null,
          unitOfMeasure: null,
          quantityMinCheck: null,
          quantityMaxUnqualified: null,
          quantityOut: null,
          quantityCheck: null,
          quantityUnqualified: null,
          quantityQuanlified: null,
          crRate: null,
          majRate: null,
          minRate: null,
          crQuantity: null,
          majQuantity: null,
          minQuantity: null,
          checkResult: 'ACCEPT',
          outDate: null,
          inspectDate: null,
          inspector: null,
          status: null,
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
        /** 查询出货检验单列表 */
        getList() {
            this.loading = true;
            listOqc(this.queryParams).then(response => {
            this.oqcList = response.rows;
            this.total = response.total;
            this.loading = false;
            });
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
        //行双击选中
        handleRowDbClick(row){
            if(row){
                this.selectedRow = row;
                this.$emit('onSelected',this.selectedRow);
                this.showFlag = false;
            }
        },
        // 单选选中数据
        handleRowChange(row) {
            if(row){
                this.selectedRow = row;
            }
        },
        handleCurrent(row){
            if(row){
                this.selectedRow = row;
            }
        },
        //确定选中
        confirmSelect(){
            if(this.selectedId ==null || this.selectedId==0){
                this.$notify({
                    title:'提示',
                    type:'warning',
                    message: '请至少选择一条数据!'
                });
                return;
            }
            this.$emit('onSelected',this.selectedRow);
            this.showFlag = false;
        }
    }
  };
  </script>
  