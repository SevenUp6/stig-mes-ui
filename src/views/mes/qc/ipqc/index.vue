<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="检验单编号" prop="ipqcCode">
        <el-input
          v-model="queryParams.ipqcCode"
          placeholder="请输入检验单编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="检验类型" prop="ipqcType">
        <el-select v-model="queryParams.ipqcType" placeholder="请选择检验类型" clearable>
          <el-option
            v-for="dict in dict.type.mes_ipqc_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="工单编号" prop="workorderCode">
        <el-input
          v-model="queryParams.workorderCode"
          placeholder="请输入工单编码"
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
        <el-select v-model="queryParams.checkResult" placeholder="请选择检验结果" clearable>
          <el-option
            v-for="dict in dict.type.mes_qc_result"
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['mes:qc:ipqc:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['mes:qc:ipqc:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['mes:qc:ipqc:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['mes:qc:ipqc:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ipqcList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="检验单编号" width="150px" align="center" prop="ipqcCode" >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="handleView(scope.row)"
            v-hasPermi="['mes:qc:ipqc:query']"
          >{{scope.row.ipqcCode}}</el-button>
        </template>
      </el-table-column>      
      <el-table-column label="检验类型" align="center" prop="ipqcType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.mes_ipqc_type" :value="scope.row.ipqcType"/>
        </template>
      </el-table-column>
      <el-table-column label="工单编号" width="150px" align="center" prop="workorderCode" />
      <el-table-column label="产品物料编码" width="120px" align="center" prop="itemCode" />
      <el-table-column label="产品物料名称" width="150px" align="center" prop="itemName" :show-overflow-tooltip="true"/>
      <el-table-column label="规格型号" align="center" prop="specification" :show-overflow-tooltip="true"/>
      <el-table-column label="单位" align="center" prop="unitOfMeasure" />
      <el-table-column label="检测数量" align="center" prop="quantityCheck" />
      <el-table-column label="检测结果" align="center" prop="checkResult" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.mes_qc_result" :value="scope.row.checkResult"/>
        </template>
      </el-table-column>

      <el-table-column label="检测日期" align="center" prop="inspectDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.inspectDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检测人员" align="center" prop="inspector" />
      <el-table-column label="单据状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.mes_order_status" :value="scope.row.status"/>
        </template>
      </el-table-column> 
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-if="scope.row.status =='PREPARE'"
            v-hasPermi="['mes:qc:ipqc:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="scope.row.status =='PREPARE'"
            v-hasPermi="['mes:qc:ipqc:remove']"
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

    <!-- 添加或修改过程检验单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="检验单编号" prop="ipqcCode">
              <el-input v-model="form.ipqcCode" placeholder="请输入检验单编号" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item  label-width="80">
              <el-switch v-model="autoGenFlag"
                  active-color="#13ce66"
                  active-text="自动生成"
                  @change="handleAutoGenChange(autoGenFlag)" v-if="optType != 'view' && form.status =='PREPARE'">               
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检验单名称" prop="ipqcName">
              <el-input v-model="form.ipqcName" placeholder="请输入检验单名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="检验类型" prop="ipqcType">
              <el-select v-model="form.ipqcType" placeholder="请选择检验类型">
                <el-option
                  v-for="dict in dict.type.mes_ipqc_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工单编码" prop="workorderCode">
              <el-input v-if="form.ipqcId == null" v-model="form.workorderCode" placeholder="请选择生产工单" >
                <el-button slot="append" icon="el-icon-search" @click="handleWorkorderSelect"></el-button>
              </el-input>
              <!--保存过则不允许修改工单，需要修改则删除重做-->
              <el-input v-else v-model="form.workorderCode" >              
              </el-input>
            </el-form-item>              
            <WorkorderSelect ref="woSelect" @onSelected="onWorkorderSelected"></WorkorderSelect>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工单名称" prop="workorderName">
              <el-input v-model="form.workorderName" readonly="readonly" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="工作站编号" prop="workstationCode">
              <el-input v-model="form.workstationCode" placeholder="请输入工作站编号" >
                <el-button slot="append" icon="el-icon-search" @click="handleWorkstationSelect"></el-button>
              </el-input>
            </el-form-item>
            <WorkstationSelect ref="wsSelect"  @onSelected="onWorkstationSelected"> </WorkstationSelect>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工作站名称" prop="workstationName">
              <el-input v-model="form.workstationName" readonly="readonly"  />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检测数量" prop="quantityCheck">
              <el-input v-model="form.quantityCheck" placeholder="请输入检测数量" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-collapse>
          <el-collapse-item>
            <template slot="title">
              更多信息<i class="header-icon el-icon-info"></i>
            </template>
            <el-row>
              <el-col :span="8">
                <el-form-item label="产品编码" prop="itemCode">
                  <el-input v-model="form.itemCode" placeholder="请输入产品编码" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="产品名称" prop="itemName">
                  <el-input v-model="form.itemName" placeholder="请输入产品名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位" prop="unitOfMeasure">
                  <el-input v-model="form.unitOfMeasure" placeholder="请输入单位" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="规格型号" prop="specification">
                  <el-input v-model="form.specification" type="textarea" placeholder="请输入内容" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="工序编码" prop="processCode">
                  <el-input v-model="form.processCode" placeholder="请输入工序编码" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="工序名称" prop="processName">
                  <el-input v-model="form.processName" placeholder="请输入工序名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="任务编号" prop="taskCode">
                  <el-input v-model="form.taskCode" placeholder="请输入任务编号" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="任务名称" prop="taskName">
                  <el-input v-model="form.taskCode" placeholder="请输入任务编号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="不合格数" prop="quantityUnqualified">
                  <el-input v-model="form.quantityUnqualified" placeholder="请输入不合格数" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="合格品数量" prop="quantityQualified">
                  <el-input v-model="form.quantityQualified" placeholder="请输入合格品数量" />
                </el-form-item>
              </el-col>
            </el-row>        
            <el-row>
              <el-col :span="8">
                <el-form-item label="致命缺陷数量" prop="crQuantity">
                  <el-input v-model="form.crQuantity" placeholder="请输入致命缺陷数量" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="严重缺陷数量" prop="majQuantity">
                  <el-input v-model="form.majQuantity" placeholder="请输入严重缺陷数量" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="轻微缺陷数量" prop="minQuantity">
                  <el-input v-model="form.minQuantity" placeholder="请输入轻微缺陷数量" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
        
        <el-row>
          <el-col :span="8">
            <el-form-item label="检测日期" prop="inspectDate">
              <el-date-picker clearable
                v-model="form.inspectDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择检测日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检测结果" prop="checkResult">
              <el-select v-model="form.checkResult" placeholder="请选择检验结果">
                <el-option
                  v-for="dict in dict.type.mes_qc_result"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检测人员" prop="inspector">
              <el-input v-model="form.inspector" placeholder="请输入检测人员" />
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
      <el-divider v-if="form.ipqcId !=null" content-position="center">检测项</el-divider> 
      <el-card shadow="always" v-if="form.ipqcId !=null" class="box-card">
          <Ipqcline ref=line :ipqcId="form.ipqcId" :optType="optType"></Ipqcline>
      </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel" v-if="optType =='view' || form.status !='PREPARE' ">返回</el-button>
        <el-button type="primary" @click="submitForm" v-if="form.status =='PREPARE' && optType !='view' ">保 存</el-button>
        <el-button type="success" @click="handleFinish" v-if="form.status =='PREPARE' && optType !='view'  && form.ipqcId !=null">完成</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listIpqc, getIpqc, delIpqc, addIpqc, updateIpqc } from "@/api/mes/qc/ipqc";
import {genCode} from "@/api/system/autocode/rule"
import WorkorderSelect from "@/components/workorderSelect/single.vue"
import WorkstationSelect from "@/components/workstationSelect/simpletableSingle.vue"
import Ipqcline from "./line.vue"
export default {
  name: "Ipqc",
  components: {WorkorderSelect,WorkstationSelect,Ipqcline},
  dicts: ['mes_ipqc_type','mes_qc_result','mes_order_status'],
  data() {
    return {
      autoGenFlag:false,
      optType: undefined,
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
      // 过程检验单表格数据
      ipqcList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ipqcCode: null,
        ipqcName: null,
        ipqcType: null,
        templateId: null,
        workorderId: null,
        workorderCode: null,
        workorderName: null,
        taskId: null,
        taskCode: null,
        taskName: null,
        workstationId: null,
        workstationCode: null,
        workstationName: null,
        processId: null,
        processCode: null,
        processName: null,
        itemId: null,
        itemCode: null,
        itemName: null,
        specification: null,
        unitOfMeasure: null,
        quantityCheck: null,
        quantityUnqualified: null,
        quantityQualified: null,
        crRate: null,
        majRate: null,
        minRate: null,
        crQuantity: null,
        majQuantity: null,
        minQuantity: null,
        checkResult: null,
        inspectDate: null,
        inspector: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        ipqcCode: [
          { required: true, message: "请输入或生产检验单编号", trigger: "blur" }
        ],
        ipqcType: [
          { required: true, message: "请选择检验类型", trigger: "change" }
        ],

        workorderCode: [
          { required: true, message: "请选择生产工单", trigger: "blur" }
        ],

        workstationCode: [
          { required: true, message: "请选择工作站", trigger: "blur" }
        ],
      
        quantityCheck: [
          { required: true, message: "检测数量不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询过程检验单列表 */
    getList() {
      this.loading = true;
      listIpqc(this.queryParams).then(response => {
        this.ipqcList = response.rows;
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
        ipqcId: null,
        ipqcCode: null,
        ipqcName: null,
        ipqcType: null,
        templateId: null,
        workorderId: null,
        workorderCode: null,
        workorderName: null,
        taskId: null,
        taskCode: null,
        taskName: null,
        workstationId: null,
        workstationCode: null,
        workstationName: null,
        processId: null,
        processCode: null,
        processName: null,
        itemId: null,
        itemCode: null,
        itemName: null,
        specification: null,
        unitOfMeasure: null,
        quantityCheck: null,
        quantityUnqualified: null,
        quantityQualified: null,
        crRate: null,
        majRate: null,
        minRate: null,
        crQuantity: null,
        majQuantity: null,
        minQuantity: null,
        checkResult: null,
        inspectDate: new Date(),
        inspector: null,
        status: "PREPARE",
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
      this.autoGenFlag = false;
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
      this.ids = selection.map(item => item.ipqcId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加过程检验单";
      this.optType = "add";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const ipqcId = row.ipqcId || this.ids
      getIpqc(ipqcId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改过程检验单";
        this.optType = "edit";
      });
    },
    //查看单据
    handleView(row){
      this.reset();
      const ipqcIds = row.ipqcId
      getIpqc(ipqcIds).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "查看检验单信息";
        this.optType = "view";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.ipqcId != null) {
            updateIpqc(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              //this.open = false;
              this.getList();
            });
          } else {
            addIpqc(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.form.ipqcId = response.data; //将返回的ID保存
              //this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    //点击完成
    handleFinish(){
      let that = this;
      if(this.form.checkResult == null){
        this.$modal.msgError("请选择检测结果！");
        return;
      }

      this.$refs["form"].validate(valid => {
        if (valid) {
          this.$modal.confirm('是否完成检验单编制？【完成后将不能更改】').then(function(){
            that.form.status = 'CONFIRMED';
            that.submitForm();
            that.open = false;
          });
        }
        });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ipqcIds = row.ipqcId || this.ids;
      this.$modal.confirm('是否确认删除过程检验单编号为"' + ipqcIds + '"的数据项？').then(function() {
        return delIpqc(ipqcIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('qc/ipqc/export', {
        ...this.queryParams
      }, `ipqc_${new Date().getTime()}.xlsx`)
    },
     //选择生产工单
    handleWorkorderSelect(){
      this.$refs.woSelect.showFlag = true;
    },
    onWorkorderSelected(row){
      if(row != undefined && row != null){
        debugger;
        this.form.workorderId = row.workorderId;
        this.form.workorderCode = row.workorderCode;
        this.form.workorderName = row.workorderName;
        this.form.itemId = row.productId;
        this.form.itemCode = row.productCode;
        this.form.itemName = row.productName;
        this.form.specification = row.productSpc;
        this.form.unitOfMeasure = row.unitOfMeasure;

      }
    },
    handleWorkstationSelect(){
      this.$refs.wsSelect.showFlag = true;
    },
    onWorkstationSelected(row){
      if(row != undefined && row != null){
        this.form.workstationId = row.workstationId;
        this.form.workstationCode = row.workstationCode;
        this.form.workstationName = row.workstationName;
      }
    },
    //自动生成编码
    handleAutoGenChange(autoGenFlag){
      if(autoGenFlag){
        genCode('IPQC_CODE').then(response =>{
          this.form.ipqcCode = response;
        });
      }else{
        this.form.ipqcCode = null;
      }
    }
  }
};
</script>
