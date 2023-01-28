<template>
  <div class="dashboard-editor-container">

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row :gutter="32" style="padding:16px 16px 0;margin-bottom:32px;">
        <el-card>
            <div slot="header" class="clearfix">
                <span>生产进度</span>
            </div>
            <el-table
                v-loading="loading"
                :data="workorderList"
                row-key="workorderId"
                default-expand-all
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                >
                <el-table-column label="工单编码" width="180" prop="workorderCode" >
                    <template slot-scope="scope">
                    <el-button
                        size="mini"
                        type="text"
                        @click="handleView(scope.row)"
                        v-hasPermi="['mes:pro:workorder:query']"
                    >{{scope.row.workorderCode}}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="订单编号" width="140" align="center" prop="sourceCode" />            
                <el-table-column label="客户名称" align="center" prop="clientName" :show-overflow-tooltip="true"/>
                <el-table-column label="产品编号" width="120" align="center" prop="productCode" />
                <el-table-column label="产品名称" width="250px" align="center" prop="productName" :show-overflow-tooltip="true"/>
                <el-table-column label="规格型号" align="center" prop="productSpc" :show-overflow-tooltip="true"/>
                <el-table-column label="单位" align="center" prop="unitOfMeasure" />
                <el-table-column label="生产进度" align="center" width="200px" >
                    <template slot-scope="scope">
                        <el-progress :text-inside="true" :stroke-width="20" :percentage="parseFloat(((scope.row.quantityProduced/scope.row.quantity*100).toFixed(2)))"></el-progress>
                    </template>
                </el-table-column>            
                <el-table-column label="需求日期" align="center" prop="requestDate" width="180">
                    <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.requestDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>         
            </el-table>
        </el-card>
    </el-row>
    
    <el-row style="background:#fff;padding:16px 16px 0; margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>

    
  </div>
</template>

<script>
import { listWorkorder } from "@/api/mes/pro/workorder";
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import RaddarChart from './dashboard/RaddarChart'
import PieChart from './dashboard/PieChart'
import BarChart from './dashboard/BarChart'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'Index',
  components: {
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart
  },
  data() {
    return {
        loading: true,
        queryParams: {},
        workorderList: [],
        lineChartData: lineChartData.newVisitis
    }
  },
  created(){
      this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listWorkorder(this.queryParams).then(response => {
        this.workorderList = response.data;
        this.loading = false;
      });
    },
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
