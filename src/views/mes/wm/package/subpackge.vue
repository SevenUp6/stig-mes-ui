<template>
    <div class="app-container">
      <el-row :gutter="10" v-if="optType !='view'" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['mes:wm:package:add']"
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
            v-hasPermi="['mes:wm:package:remove']"
          >删除</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
      <PackageSelectSingle ref="packageSelect" @onSelected="onPackageSelected"></PackageSelectSingle>
      <el-table v-loading="loading" :data="packageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="装箱单编号" width="150px" align="center" prop="packageCode" />
        <el-table-column label="装箱日期" align="center" prop="packageDate" width="120">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.packageDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销售订单编号" width="100px" align="center" prop="soCode" />
        <el-table-column label="客户编码" align="center" prop="clientCode" />
        <el-table-column label="客户名称" width="120px" align="center" prop="clientName" :show-overflow-tooltip="true"/>
        <el-table-column label="箱长度" align="center" prop="packageLength" />
        <el-table-column label="箱宽度" align="center" prop="packageWidth" />
        <el-table-column label="箱高度" align="center" prop="packageHeight" />
        <el-table-column label="尺寸单位" align="center" prop="sizeUnit" />
        <el-table-column label="净重" align="center" prop="netWeight" />
        <el-table-column label="毛重" align="center" prop="crossWeight" />
        <el-table-column label="重量单位" align="center" prop="weightUnit" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['mes:wm:package:remove']"
              v-if="optType !='view'"
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
  
      
    </div>
  </template>
  
  <script>
  import { listPackage, delPackage, addSubPackage} from "@/api/mes/wm/package";
  import PackageSelectSingle from "@/components/package/single.vue";
  export default {
    name: "SubPackage",
    dicts: ['sys_yes_no'],
    components: {PackageSelectSingle},
    props: {
        parentId: null,
        optType: null
    },
    data() {
      return {
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
        // 装箱单表格数据
        packageList: [],
        //单位数据
        measureOptions: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          parentId: this.parentId,
          ancestors: null,
          packageCode: null,
          barcodeId: null,
          barcodeContent: null,
          barcodeUrl: null,
          packageDate: null,
          soCode: null,
          invoiceCode: null,
          clientId: null,
          clientCode: null,
          clientName: null,
          clientNick: null,
          packageLength: null,
          packageWidth: null,
          packageHeight: null,
          sizeUnit: null,
          netWeight: null,
          crossWeight: null,
          weightUnit: null,
          inspector: null,
          inspectorName: null,
          enableFlag: null,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          packageCode: [
            { required: true, message: "箱不能为空", trigger: "blur" }
          ]
        }
      };
    },
    created() {
      this.getList();

    },
    methods: {
      /** 查询装箱单列表 */
      getList() {
        this.loading = true;
        listPackage(this.queryParams).then(response => {
          this.packageList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },

      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
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
        this.ids = selection.map(item => item.packageId)
        this.single = selection.length!==1
        this.multiple = !selection.length
      },
      
      /** 新增按钮操作 */
      handleAdd() {
        this.$refs.packageSelect.showFlag=true;
      },
      /**选择装箱单返回 */
      onPackageSelected(obj){
        var subpackage = {
            packageId: obj.packageId,
            parentId: this.parentId
        }
        addSubPackage(subpackage).then(response => {
            this.$modal.msgSuccess("添加成功");
            this.getList();
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const packageIds = row.packageId || this.ids;
        this.$modal.confirm('是否确认删除装箱单编号为"' + packageIds + '"的数据项？').then(function() {
          return delPackage(packageIds);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      }
    }
  };
  </script>
  