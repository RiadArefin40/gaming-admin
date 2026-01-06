<template>
  <div class="dashboard">

    <!-- HEADER -->
    <header class="dashboard-header">
      <div>
        <h2>Global Dashboard</h2>
        <span class="subtitle">Live System Overview</span>
      </div>

      <!-- DATE FILTER -->
      <div class="date-filter">
        <label>From:</label>
        <input type="date" v-model="filterStart" />
        <label>To:</label>
        <input type="date" v-model="filterEnd" />
        <button class="btn-apply" @click="applyFilter">Apply</button>
        <button class="btn-clear" @click="clearFilter">Clear</button>
      </div>
    </header>

    <!-- STATS -->
    <div class="stats-grid">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="stat-card skeleton"></div>
      </template>
      <template v-else>
        <div v-for="card in stats" :key="card.label" class="stat-card" :class="card.color">
          <div class="stat-title">{{ card.label }}</div>
          <div class="stat-value">{{ card.value.toLocaleString() }}</div>
        </div>
      </template>
    </div>

    <!-- SUMMARY -->
    <div class="summary-grid">
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="summary-card skeleton"></div>
      </template>
      <template v-else>
        <div v-for="item in summary" :key="item.label" class="summary-card">
          <div class="summary-title">{{ item.label }}</div>
          <div class="summary-value" :class="item.value >= 0 ? 'text-green' : 'text-red'">
            {{ item.value.toLocaleString() }}
          </div>
        </div>
      </template>
    </div>

    <!-- RECENT TRANSACTIONS -->
    <div class="transactions-card">
      <h3 class="mb-2">Recent Transactions</h3>

      <!-- TAB TOGGLE -->
      <div class="tab-toggle">
        <button :class="{ active: transactionTab === 'All' }" @click="transactionTab = 'All'">All</button>
        <button :class="{ active: transactionTab === 'Deposit' }" @click="transactionTab = 'Deposit'">Deposit</button>
        <button :class="{ active: transactionTab === 'Withdraw' }" @click="transactionTab = 'Withdraw'">Withdraw</button>
      </div>


      <v-data-table
  :headers="headers"
  :items="displayedTransactions"
   dense
>
  <!-- Date -->
  <template #item.created_at="{ item }">
    {{ formatDate(item.created_at) }}
  </template>

  <!-- User -->
  <template #item.user_id="{ item }">
    #{{ item.user_id }}
  </template>

  <!-- Amount -->
  <template #item.amount="{ item }">
    <span :class="item.type === 'Deposit' ? 'text-green' : 'text-red'">
      {{ item.amount }}
    </span>
  </template>

  <!-- Status -->
  <template #item.status="{ item }">
    <span
      :class="{
        'status-ok': item.status === 'approved',
        'status-warn': item.status === 'processing',
        'status-bad': item.status === 'failed' || item.status === 'rejected'
      }"
    >
      {{ item.status }}
    </span>
  </template>

  <!-- Empty state -->
  <template #no-data>
    <div class="text-center text-grey py-4">
      No transactions found
    </div>
  </template>
</v-data-table>


      <!-- <table v-else class="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in displayedTransactions" :key="t.id">
            <td>{{ formatDate(t.created_at) }}</td>
            <td>#{{ t.user_id }}</td>
            <td>{{ t.type }}</td>
            <td :class="t.type === 'Deposit' ? 'text-green' : 'text-red'">{{ t.amount }}</td>
            <td>
              <span :class="{
                'status-ok': t.status === 'approved',
                'status-warn': t.status === 'processing',
                'status-bad': t.status === 'failed' || t.status === 'rejected'
              }">{{ t.status }}</span>
            </td>
          </tr>
          <tr v-if="displayedTransactions.length === 0">
            <td colspan="5" class="text-center text-grey">No transactions found</td>
          </tr>
        </tbody>
      </table> -->
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"

// ---------- DATA ----------
const deposits = ref([])
const withdrawals = ref([])
const loading = ref(true)

// Date filter
const filterStart = ref('')
const filterEnd = ref('')

const headers = [
    { title: "User", value: "user_name" },
  { title: "Date", value: "created_at" },

  { title: "Type", value: "type" },
  { title: "Amount", value: "amount" },
  { title: "Status", value: "status" },
];


// Transaction tab: All / Deposit / Withdraw
const transactionTab = ref('All')

// ---------- FETCH ----------
const fetchData = async () => {
  loading.value = true
  try {
    const [depRes, witRes] = await Promise.all([
      fetch("https://api.bajiraj.cloud/deposit"),
      fetch("https://api.bajiraj.cloud/withdrawals")
    ])
    const dep = await depRes.json()
    const wit = await witRes.json()

    deposits.value = dep || []
    withdrawals.value = wit || []
    console.log(deposits.value, withdrawals.value)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
    applyFilter()
  }
}

onMounted(fetchData)

// ---------- HELPERS ----------
const formatDate = date => new Date(date).toLocaleString()
const isToday = date => new Date(date).toDateString() === new Date().toDateString()
const isThisWeek = date => new Date() - new Date(date) < 7 * 86400000
const isThisMonth = date => {
  const d = new Date(date)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

// ---------- FILTERED DATA ----------
const filteredDeposits = ref([])
const filteredWithdrawals = ref([])
const filteredTransactions = ref([])

// Apply date filter
const applyFilter = () => {
  const start = filterStart.value ? new Date(filterStart.value) : new Date('1970-01-01')
  const end = filterEnd.value ? new Date(filterEnd.value) : new Date()

  filteredDeposits.value = deposits.value.filter(d => {
    const date = new Date(d.created_at)
    return date >= start && date <= end
  })

  filteredWithdrawals.value = withdrawals.value.filter(w => {
    const date = new Date(w.created_at)
    return date >= start && date <= end
  })

  filteredTransactions.value = [
    ...filteredDeposits.value.map(d => ({ ...d, type: "Deposit" })),
    ...filteredWithdrawals.value.map(w => ({ ...w, type: "Withdraw" }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

// Clear filter
const clearFilter = () => {
  filterStart.value = ''
  filterEnd.value = ''
  applyFilter()
}

// ---------- STATS ----------
const stats = computed(() => {
  const totalDep = filteredDeposits.value.reduce((a, b) => a + +b.amount, 0)
  const totalWit = filteredWithdrawals.value.reduce((a, b) => a + +b.amount, 0)
  const netProfit = totalDep - totalWit

  return [
    { label: "Total Deposit", value: totalDep, color: "green" },
    { label: "Total Withdraw", value: totalWit, color: "red" },
    { label: "Net Profit", value: netProfit, color: netProfit >= 0 ? "green" : "red" },
    { label: "Transactions", value: filteredDeposits.value.length + filteredWithdrawals.value.length, color: "purple" }
  ]
})

const calcProfit = (filterFn) =>
  deposits.value.filter(d => filterFn(d.created_at)).reduce((a, b) => a + +b.amount, 0) -
  withdrawals.value.filter(w => filterFn(w.created_at)).reduce((a, b) => a + +b.amount, 0)

const summary = computed(() => [
  { label: "Today", value: calcProfit(isToday) },
  { label: "This Week", value: calcProfit(isThisWeek) },
  { label: "This Month", value: calcProfit(isThisMonth) }
])

// ---------- TAB FILTER ----------
const displayedTransactions = computed(() => {
  if (transactionTab.value === 'All') return filteredTransactions.value
  return filteredTransactions.value.filter(t => t.type === transactionTab.value)
})
</script>

<style>
.dashboard { padding:20px; font-family:"Inter",sans-serif; background:#f5f7fa; }

/* Header */
.dashboard-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; }
.dashboard-header h2 { margin:0; font-size:24px; }
.subtitle { font-size:14px; color:#6b7280; }

/* Date filter */
.date-filter { display:flex; align-items:center; gap:10px; }
.date-filter input { padding:6px 10px; border-radius:6px; border:1px solid #d1d5db; }
.btn-apply { padding:6px 12px; border:none; border-radius:6px; background:#3b82f6; color:white; cursor:pointer; transition:0.3s; }
.btn-apply:hover { background:#2563eb; }
.btn-clear { padding:6px 12px; border:none; border-radius:6px; background:#9ca3af; color:white; cursor:pointer; transition:0.3s; }
.btn-clear:hover { background:#6b7280; }

/* Stats */
.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:20px; margin-top:20px; }
.stat-card { padding:20px; border-radius:12px; background:#fff; box-shadow:0 10px 25px rgba(0,0,0,0.05); transition: transform 0.3s; }
.stat-card:hover { transform: translateY(-3px); }
.stat-title { font-size:14px; color:#6b7280; }
.stat-value { font-size:22px; font-weight:700; }
.green { background:#dcfce7; color:#166534; }
.red { background:#fee2e2; color:#991b1b; }
.blue { background:#dbeafe; color:#1e40af; }
.purple { background:#ede9fe; color:#5b21b6; }

/* Summary */
.summary-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; margin-top:30px; }
.summary-card { padding:15px; border-radius:12px; background:#fff; box-shadow:0 8px 20px rgba(0,0,0,0.05); }
.summary-title { font-size:13px; color:#6b7280; }
.summary-value { font-size:20px; font-weight:600; }
.text-green { color:#16a34a; }
.text-red { color:#dc2626; }

/* Transactions */
.transactions-card { margin-top:30px; padding:20px; border-radius:12px; background:#fff; box-shadow:0 10px 25px rgba(0,0,0,0.05); }
.transactions-table { width:100%; border-collapse:collapse; margin-top:10px; }
.transactions-table th, .transactions-table td { padding:10px; text-align:left; }
.transactions-table th { color:#6b7280; }
.status-ok { color:#16a34a; font-weight:600; }
.status-warn { color:#f59e0b; font-weight:600; }
.status-bad { color:#dc2626; font-weight:600; }

/* Skeletons */
.skeleton { height:100px; background:linear-gradient(-90deg,#e5e7eb 0%,#f3f4f6 50%,#e5e7eb 100%); background-size:400% 400%; animation:shimmer 1.5s ease-in-out infinite; border-radius:12px; }
.skeleton-row { height:40px; margin-bottom:10px; background:linear-gradient(-90deg,#e5e7eb 0%,#f3f4f6 50%,#e5e7eb 100%); background-size:400% 400%; animation:shimmer 1.5s ease-in-out infinite; border-radius:6px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* TAB TOGGLE */
.tab-toggle { display:flex; gap:10px; margin-bottom:15px; }
.tab-toggle button {
  padding:6px 12px; border:none; border-radius:6px; background:#e5e7eb; cursor:pointer; transition:0.3s;
}
.tab-toggle button.active { background:#3b82f6; color:white; }
.tab-toggle button:hover { background:#2563eb; color:white; }

/* ---------- MOBILE RESPONSIVE ---------- */
@media (max-width: 768px) {

  /* Header stacks vertically */
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  /* Date filter stacked */
  .date-filter {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  /* Buttons full width */
  .btn-apply, .btn-clear {
    width: 100%;
  }

  /* Stats grid becomes single column */
  .stats-grid {
    grid-template-columns: 1fr;
  }

  /* Summary grid becomes single column */
  .summary-grid {
    grid-template-columns: 1fr;
  }

  /* Transaction table scrollable horizontally */
  .transactions-card {
    overflow-x: auto;
  }

  .transactions-table {
    min-width: 600px; /* ensures horizontal scroll on small screens */
  }

  /* Tab toggle buttons stack */
  .tab-toggle {
    flex-direction: column;
    gap: 8px;
  }
}

/* Optional: Smaller font sizes on mobile */
@media (max-width: 480px) {
  .dashboard-header h2 { font-size: 20px; }
  .subtitle { font-size: 12px; }
  .stat-title { font-size: 12px; }
  .stat-value { font-size: 18px; }
  .summary-title { font-size: 12px; }
  .summary-value { font-size: 16px; }
  .transactions-table th, .transactions-table td { padding: 6px; font-size: 12px; }
  .btn-apply, .btn-clear { padding: 6px; font-size: 14px; }
}
</style>
