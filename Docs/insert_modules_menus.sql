DELETE FROM JAN_ROLE_MENU;
DELETE FROM JAN_MENUS;
DELETE FROM JAN_MODULES;

-- Insert data for JAN_MODULES
INSERT INTO JAN_MODULES
    (MODULE_ID, MODULE_CODE, MODULE_NAME, DEFAULT_MENU, SORT_ORDER, REMARKS, STATUS, CREATED_BY)
VALUES
    (1, 'ADM',   'Admin',   'Main',             1, 'Admin module',   'ACTIVE', 'SYSTEM'),
    (2, 'PES',   'PES',     'Dashboards',       2, 'PES module',     'ACTIVE', 'SYSTEM'),
    (3, 'PESL',  'PESLite', 'Branch Planner',   3, 'PESLite module', 'ACTIVE', 'SYSTEM'),
    (4, 'DMS',   'DMS',     'Documents',        4, 'DMS module',     'ACTIVE', 'SYSTEM'),
    (5, 'SCM',   'SCM',     'Procurement',      5, 'SCM module',     'ACTIVE', 'SYSTEM'),
    (6, 'PMS',   'PMS',     'Projects',         6, 'PMS module',     'ACTIVE', 'SYSTEM'),
    (7, 'MES',   'MES',     'Shop Floor',       7, 'MES module',     'ACTIVE', 'SYSTEM'),
    (8, 'FIN',   'Finance', 'Masters',          8, 'Finance module', 'ACTIVE', 'SYSTEM');

-- Insert data for JAN_MENUS
INSERT INTO JAN_MENUS
    (MENU_CODE, MENU_NAME, DISPLAY_NAME, MODULE_ID, PARENT_MENU_ID, MENU_TYPE, NATURE, SORT_ORDER, STATUS, CREATED_BY, MENU_PATH, MENU_ICON)
VALUES
    -- Admin
    ('ADMMAIN', 'Main', 'Main',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'ADM'), NULL, 'MASTER', 'PARENT', 1, 'ACTIVE', 'SYSTEM', '/admin/main', 'settings'),
    ('ADMUM', 'User Master', 'User Master',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'ADM'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'ADMMAIN') AS t), 'MASTER', 'CHILD', 1, 'ACTIVE', 'SYSTEM', '/admin/user-master', 'user'),
    ('ADMRM', 'Role Master', 'Role Master',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'ADM'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'ADMMAIN') AS t), 'MASTER', 'CHILD', 2, 'ACTIVE', 'SYSTEM', '/admin/role-master', 'shield'),
    ('ADMMM', 'Module Master', 'Module Master',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'ADM'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'ADMMAIN') AS t), 'MASTER', 'CHILD', 3, 'ACTIVE', 'SYSTEM', '/admin/module-master', 'boxes'),
    ('ADMMNU', 'Menu Master', 'Menu Master',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'ADM'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'ADMMAIN') AS t), 'MASTER', 'CHILD', 4, 'ACTIVE', 'SYSTEM', '/admin/menu-master', 'menu'),
    ('ADMRVM', 'Role vs Module', 'Role vs Module',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'ADM'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'ADMMAIN') AS t), 'MASTER', 'CHILD', 5, 'ACTIVE', 'SYSTEM', '/admin/role-vs-module', 'link'),
    ('ADMRVME', 'Role vs Menu', 'Role vs Menu',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'ADM'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'ADMMAIN') AS t), 'MASTER', 'CHILD', 6, 'ACTIVE', 'SYSTEM', '/admin/role-vs-menu', 'list-checks'),
    ('ADM UAR', 'User Access Rights', 'User Access Rights',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'ADM'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'ADMMAIN') AS t), 'MASTER', 'CHILD', 7, 'ACTIVE', 'SYSTEM', '/admin/user-access-rights', 'key'),
    ('ADMUH', 'User Hierarchy', 'User Hierarchy',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'ADM'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'ADMMAIN') AS t), 'MASTER', 'CHILD', 8, 'ACTIVE', 'SYSTEM', '/admin/user-hierarchy', 'network'),

    -- PES
    ('PESDASH', 'Dashboards', 'Dashboards',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), NULL, 'REPORT', 'PARENT', 1, 'ACTIVE', 'SYSTEM', '/pes/dashboards', 'layout-dashboard'),
    ('PESPCE', 'Planning & Execution Control', 'Planning & Execution Control',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESDASH') AS t), 'REPORT', 'CHILD', 1, 'ACTIVE', 'SYSTEM', '/pes/dashboards/planning-execution-control', 'activity'),
    ('PESOPD', 'Operations Dashboard', 'Operations Dashboard',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESDASH') AS t), 'REPORT', 'CHILD', 2, 'ACTIVE', 'SYSTEM', '/pes/dashboards/operations-dashboard', 'gauge'),
    ('PESPOV', 'Planning Overview', 'Planning Overview',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESDASH') AS t), 'REPORT', 'CHILD', 3, 'ACTIVE', 'SYSTEM', '/pes/dashboards/planning-overview', 'calendar-days'),
    ('PESEXS', 'Executive Summary', 'Executive Summary',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESDASH') AS t), 'REPORT', 'CHILD', 4, 'ACTIVE', 'SYSTEM', '/pes/dashboards/executive-summary', 'presentation'),
    ('PESKPI', 'KPI''s', 'KPI''s',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), NULL, 'REPORT', 'PARENT', 2, 'ACTIVE', 'SYSTEM', '/pes/kpis', 'chart-no-axes-combined'),
    ('PESOCQ', 'OCQ completion', 'OCQ completion',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESKPI') AS t), 'REPORT', 'CHILD', 1, 'ACTIVE', 'SYSTEM', '/pes/kpis/ocq-completion', 'circle-check'),
    ('PESOTD', 'On-Time Delivery', 'On-Time Delivery',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESKPI') AS t), 'REPORT', 'CHILD', 2, 'ACTIVE', 'SYSTEM', '/pes/kpis/on-time-delivery', 'clock'),
    ('PESCRP', 'Customer Rejection PPM', 'Customer Rejection PPM',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESKPI') AS t), 'REPORT', 'CHILD', 3, 'ACTIVE', 'SYSTEM', '/pes/kpis/customer-rejection-ppm', 'alert-triangle'),
    ('PESFR', 'Fill Rate', 'Fill Rate',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESKPI') AS t), 'REPORT', 'CHILD', 4, 'ACTIVE', 'SYSTEM', '/pes/kpis/fill-rate', 'percent'),
    ('PESALT', 'Alerts', 'Alerts',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), NULL, 'TRANSACTION', 'PARENT', 3, 'ACTIVE', 'SYSTEM', '/pes/alerts', 'bell'),
    ('PESAA', 'Active Alerts', 'Active Alerts',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESALT') AS t), 'TRANSACTION', 'CHILD', 1, 'ACTIVE', 'SYSTEM', '/pes/alerts/active-alerts', 'bell-ring'),
    ('PESAH', 'Alert History', 'Alert History',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESALT') AS t), 'REPORT', 'CHILD', 2, 'ACTIVE', 'SYSTEM', '/pes/alerts/alert-history', 'history'),
    ('PESAC', 'Alert Configuration', 'Alert Configuration',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESALT') AS t), 'MASTER', 'CHILD', 3, 'ACTIVE', 'SYSTEM', '/pes/alerts/alert-configuration', 'sliders-horizontal'),
    ('PESTRN', 'Transactions', 'Transactions',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), NULL, 'TRANSACTION', 'PARENT', 4, 'ACTIVE', 'SYSTEM', '/pes/transactions', 'repeat'),
    ('PESPCP', 'Product Custodian Portfolio', 'Product Custodian Portfolio',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESTRN') AS t), 'TRANSACTION', 'CHILD', 1, 'ACTIVE', 'SYSTEM', '/pes/transactions/product-custodian-portfolio', 'briefcase'),
    ('PESBP', 'Branch Planner', 'Branch Planner',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESTRN') AS t), 'TRANSACTION', 'CHILD', 2, 'ACTIVE', 'SYSTEM', '/pes/transactions/branch-planner', 'map-pinned'),
    ('PESHOP', 'HO Planner', 'HO Planner',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESTRN') AS t), 'TRANSACTION', 'CHILD', 3, 'ACTIVE', 'SYSTEM', '/pes/transactions/ho-planner', 'building-2'),
    ('PESDF', 'Demand Forecast', 'Demand Forecast',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESTRN') AS t), 'TRANSACTION', 'CHILD', 4, 'ACTIVE', 'SYSTEM', '/pes/transactions/demand-forecast', 'trending-up'),
    ('PESRO', 'Replenishment Orders', 'Replenishment Orders',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PES'), (SELECT menu_id FROM (SELECT MENU_ID FROM JAN_MENUS WHERE MENU_CODE = 'PESTRN') AS t), 'TRANSACTION', 'CHILD', 5, 'ACTIVE', 'SYSTEM', '/pes/transactions/replenishment-orders', 'package-plus'),

    -- PESLite
    ('PESLBP', 'Branch Planner', 'Branch Planner',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PESL'), NULL, 'TRANSACTION', 'MENU', 1, 'ACTIVE', 'SYSTEM', '/peslite/branch-planner', 'map-pinned'),
    ('PESLHP', 'HO Planner', 'HO Planner',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PESL'), NULL, 'TRANSACTION', 'MENU', 2, 'ACTIVE', 'SYSTEM', '/peslite/ho-planner', 'building-2'),
    ('PESLPC', 'Product Custodian', 'Product Custodian',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PESL'), NULL, 'TRANSACTION', 'MENU', 3, 'ACTIVE', 'SYSTEM', '/peslite/product-custodian', 'briefcase'),
    ('PESLCC', 'Commodity Custodian', 'Commodity Custodian',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PESL'), NULL, 'TRANSACTION', 'MENU', 4, 'ACTIVE', 'SYSTEM', '/peslite/commodity-custodian', 'boxes'),
    ('PESLVP', 'Vendor Planner', 'Vendor Planner',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PESL'), NULL, 'TRANSACTION', 'MENU', 5, 'ACTIVE', 'SYSTEM', '/peslite/vendor-planner', 'users'),

    -- DMS
    ('DMSDOC', 'Documents', 'Documents',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'DMS'), NULL, 'TRANSACTION', 'MENU', 1, 'ACTIVE', 'SYSTEM', '/dms/documents', 'file-text'),

    -- SCM
    ('SCMPROC', 'Procurement', 'Procurement',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'SCM'), NULL, 'TRANSACTION', 'MENU', 1, 'ACTIVE', 'SYSTEM', '/scm/procurement', 'shopping-cart'),

    -- PMS
    ('PMSPROJ', 'Projects', 'Projects',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'PMS'), NULL, 'TRANSACTION', 'MENU', 1, 'ACTIVE', 'SYSTEM', '/pms/projects', 'folder-kanban'),

    -- MES
    ('MESSF', 'Shop Floor', 'Shop Floor',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'MES'), NULL, 'TRANSACTION', 'MENU', 1, 'ACTIVE', 'SYSTEM', '/mes/shop-floor', 'factory'),

    -- Finance
    ('FINMST', 'Masters', 'Masters',
        (SELECT MODULE_ID FROM JAN_MODULES WHERE MODULE_CODE = 'FIN'), NULL, 'MASTER', 'MENU', 1, 'ACTIVE', 'SYSTEM', '/finance/masters', 'dollar-sign');

-- Re-seed Role Menu permissions for Admin role (Full permissions on all newly inserted menus)
INSERT INTO JAN_ROLE_MENU (ROLE_ID, MODULE_ID, MENU_ID, PERM_VIEW, PERM_ADD, PERM_EDIT, PERM_DELETE, PERM_EXPORT, PERM_APPROVE, CREATED_BY)
SELECT 1, MODULE_ID, MENU_ID, 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'SYSTEM' FROM JAN_MENUS;
