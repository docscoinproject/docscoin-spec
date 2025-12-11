// DOCScoin Document Generator - JavaScript Logic

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const standardRadios = document.querySelectorAll('input[name="standard"]');
    const countryStep = document.getElementById('country-step');
    const countryCheckboxes = document.querySelectorAll('input[name="country"]');
    const templateRadios = document.querySelectorAll('input[name="template"]');
    const documentPreview = document.getElementById('documentPreview');
    const generatePdfBtn = document.getElementById('generatePdf');
    const generateDocBtn = document.getElementById('generateDoc');
    const generateExcelBtn = document.getElementById('generateExcel');
    const generateJsonBtn = document.getElementById('generateJson');
    const refreshPreviewBtn = document.getElementById('refreshPreview');
    const loadSampleBtn = document.getElementById('loadSample');
    const statusMessage = document.getElementById('statusMessage');
    const statusText = document.getElementById('statusText');
    const fieldsList = document.querySelector('.fields-list');

    // Sample data
    const sampleData = {
        employeeName: "Ivan Ivanov",
        passportSeries: "1234",
        passportNumber: "567890",
        inn: "770112345678",
        position: "Senior Developer",
        salary: "85000",
        currency: "USD",
        employeeId: "EMP-2025-001",
        department: "Software Development",
        hireDate: "2025-12-09",
        guid: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    };

    // Field mapping configuration
    const fieldMapping = {
		// Global fields
		'GLOBAL:IDENTIFIER:GUID': () => document.getElementById('globalId').value || generateUUID(),
		
		// Russia fields
		'NATIONAL:RU:PASSPORT:SERIES': () => document.getElementById('ruPassportSeries').value,
		'NATIONAL:RU:PASSPORT:NUMBER': () => document.getElementById('ruPassportNumber').value,
		'NATIONAL:RU:TAX:INN': () => document.getElementById('ruINN').value,
		'NATIONAL:RU:SOCIAL:SNILS': () => document.getElementById('ruSNILS').value,
		
		// Ukraine fields
		'NATIONAL:UA:PASSPORT:SERIES': () => document.getElementById('uaPassportSeries').value,
		'NATIONAL:UA:PASSPORT:NUMBER': () => document.getElementById('uaPassportNumber').value,
		'NATIONAL:UA:TAX:TIN': () => document.getElementById('uaTIN').value,
		
		// USA fields
		'NATIONAL:US:TAX:SSN': () => document.getElementById('usSSN').value,
		'NATIONAL:US:IDENTITY:DRIVER_LICENSE': () => document.getElementById('usDriverLicense').value,
		
		// China fields
		'NATIONAL:CN:ID:CARD': () => document.getElementById('cnIDCard')?.value || '',
		'NATIONAL:CN:SOCIAL:CREDIT_CODE': () => document.getElementById('cnSocialCredit')?.value || '',

		// India fields  
		'NATIONAL:IN:IDENTITY:AADHAAR': () => document.getElementById('inAadhaar')?.value || '',
		'NATIONAL:IN:TAX:PAN': () => document.getElementById('inPAN')?.value || '',
		
		// Enterprise fields
		'ENTERPRISE:EMPLOYEE:FULL_NAME': () => document.getElementById('employeeName').value,
		'ENTERPRISE:EMPLOYEE:ID': () => document.getElementById('employeeId').value,
		'ENTERPRISE:EMPLOYEE:POSITION': () => document.getElementById('position').value,
		'ENTERPRISE:SALARY:BASE': () => document.getElementById('salary').value,
		'ENTERPRISE:SALARY:CURRENCY': () => document.getElementById('currency').value,
		'ENTERPRISE:EMPLOYEE:DEPARTMENT': () => document.getElementById('department').value,
		
		// Document fields
		'DOCUMENT:DATE': () => new Date().toISOString().split('T')[0],
		'DOCUMENT:NUMBER': () => `DOC-${Date.now().toString().slice(-6)}`
	};

    // Initialize
    init();
	
	function updateFieldSections() {
		const selectedStandard = document.querySelector('input[name="standard"]:checked').value;
		const selectedCountry = document.querySelector('input[name="country"]:checked')?.value;
		
		// Всегда показываем глобальные поля
		const globalFields = document.getElementById('global-fields');
		if (globalFields) globalFields.style.display = 'block';
		
		// Показываем/скрываем страны в зависимости от стандарта
		const countryStep = document.getElementById('country-step');
		const multiCountrySelect = document.getElementById('multi-country-select');
		
		if (selectedStandard === 'national' || selectedStandard === 'all') {
			if (countryStep) countryStep.style.display = 'block';
			
			// Скрываем все национальные поля сначала
			const allCountryFields = ['ru-fields', 'ua-fields', 'us-fields', 'cn-fields', 'in-fields'];
			allCountryFields.forEach(id => {
				const element = document.getElementById(id);
				if (element) element.style.display = 'none';
			});
			
			if (selectedCountry === 'multiple') {
				// Показываем мульти-выбор
				if (multiCountrySelect) multiCountrySelect.style.display = 'block';
				
				// Показываем все выбранные страны
				const multiCountries = document.querySelectorAll('input[name="multi-country"]:checked');
				multiCountries.forEach(checkbox => {
					const countryId = checkbox.value + '-fields';
					const element = document.getElementById(countryId);
					if (element) element.style.display = 'block';
				});
			} else if (selectedCountry && selectedCountry !== 'multiple') {
				if (multiCountrySelect) multiCountrySelect.style.display = 'none';
				const countryFields = document.getElementById(selectedCountry + '-fields');
				if (countryFields) countryFields.style.display = 'block';
			}
		} else {
			if (countryStep) countryStep.style.display = 'none';
			if (multiCountrySelect) multiCountrySelect.style.display = 'none';
			
			// Скрываем все национальные поля
			const allCountryFields = ['ru-fields', 'ua-fields', 'us-fields', 'cn-fields', 'in-fields'];
			allCountryFields.forEach(id => {
				const element = document.getElementById(id);
				if (element) element.style.display = 'none';
			});
		}
		
		// Enterprise поля показываем для Enterprise и All
		const enterpriseFields = document.getElementById('enterprise-fields');
		if (enterpriseFields) {
			if (selectedStandard === 'enterprise' || selectedStandard === 'all') {
				enterpriseFields.style.display = 'block';
			} else {
				enterpriseFields.style.display = 'none';
			}
		}
	}

	function generateUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

    function init() {
        // Event Listeners
        standardRadios.forEach(radio => {
            radio.addEventListener('change', handleStandardChange);
        });

        countryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updatePreview);
        });

        templateRadios.forEach(radio => {
            radio.addEventListener('change', handleTemplateChange);
        });

        // Input fields live update
        const inputFields = ['employeeName', 'passportSeries', 'passportNumber', 
                           'inn', 'position', 'salary', 'currency'];
        inputFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', updatePreview);
            }
        });

        // Button events
        generatePdfBtn.addEventListener('click', generatePdf);
        generateDocBtn.addEventListener('click', generateDoc);
        generateExcelBtn.addEventListener('click', generateExcel);
        generateJsonBtn.addEventListener('click', generateJson);
        refreshPreviewBtn.addEventListener('click', updatePreview);
        loadSampleBtn.addEventListener('click', loadSampleData);

        // Initial preview
        updatePreview();
        updateFieldStatus();
		
		// Новые обработчики
		
		// Обработчики для стандартов
		standardRadios.forEach(radio => {
			radio.addEventListener('change', function() {
				console.log('Standard changed to:', this.value);
				handleStandardChange();
				updateFieldSections();
				updatePreview();
			});
		});
		
		// Обработчики для стран
		const countryRadios = document.querySelectorAll('input[name="country"]');
		countryRadios.forEach(radio => {
			radio.addEventListener('change', function() {
				console.log('Country changed to:', this.value);
				updateFieldSections();
				updatePreview();
			});
		});
		
		// Обработчики для мульти-выбора стран
		const multiCountryCheckboxes = document.querySelectorAll('input[name="multi-country"]');
		multiCountryCheckboxes.forEach(checkbox => {
			checkbox.addEventListener('change', function() {
				updateFieldSections();
				updatePreview();
			});
		});
	
		countryCheckboxes.forEach(checkbox => {
			checkbox.addEventListener('change', function() {
				updateFieldSections();
				updatePreview();
			});
		});
		
		// Инициализация UUID
		document.getElementById('globalId').value = generateUUID();
		
		// Инициализация полей
		updateFieldSections();
	}

	function handleStandardChange() {
		const selectedStandard = document.querySelector('input[name="standard"]:checked').value;
		
		if (selectedStandard === 'national' || selectedStandard === 'all') {
			document.getElementById('country-step').style.display = 'block';
			// Выбираем первую страну по умолчанию
			document.querySelector('input[name="country"][value="ru"]').checked = true;
		} else {
			document.getElementById('country-step').style.display = 'none';
		}
		
		updateFieldSections();
	}

    function handleTemplateChange() {
        const selectedTemplate = document.querySelector('input[name="template"]:checked').value;
        
        // Update preview based on template
        updateDocumentTemplate(selectedTemplate);
        updatePreview();
    }

    function updateDocumentTemplate(template) {
        let templateHtml = '';
        
        switch(template) {
            case 'employment-contract':
                templateHtml = `
                    <div class="document-header">
                        <h3 class="document-title">EMPLOYMENT CONTRACT</h3>
                        <p class="document-subtitle">Agreement No: <span class="placeholder" data-field="DOCUMENT:NUMBER">[DOC-001]</span></p>
                    </div>
                    
                    <div class="document-section">
                        <h4>PARTIES</h4>
                        <p>This Employment Contract is made between:</p>
                        <p><strong>Employer:</strong> [Company Name]</p>
                        <p><strong>Employee:</strong> <span class="placeholder highlighted" data-field="ENTERPRISE:EMPLOYEE:FULL_NAME">[Employee Full Name]</span></p>
                    </div>
                    
                    <div class="document-section">
                        <h4>EMPLOYEE INFORMATION</h4>
                        <table class="data-table">
                            <tr>
                                <td>Passport:</td>
                                <td>
                                    Series: <span class="placeholder" data-field="NATIONAL:RU:PASSPORT:SERIES">[1234]</span>
                                    Number: <span class="placeholder" data-field="NATIONAL:RU:PASSPORT:NUMBER">[567890]</span>
                                </td>
                            </tr>
                            <tr>
                                <td>Tax ID (INN):</td>
                                <td><span class="placeholder" data-field="NATIONAL:RU:TAX:INN">[770112345678]</span></td>
                            </tr>
                            <tr>
                                <td>Employee ID:</td>
                                <td><span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:ID">[EMP-001]</span></td>
                            </tr>
                            <tr>
                                <td>Position:</td>
                                <td><span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:POSITION">[Position]</span></td>
                            </tr>
                            <tr>
                                <td>Department:</td>
                                <td><span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:DEPARTMENT">[Department]</span></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="document-section">
                        <h4>COMPENSATION</h4>
                        <p>Base Salary: <span class="placeholder" data-field="ENTERPRISE:SALARY:BASE">[85000]</span> 
                           <span class="placeholder" data-field="ENTERPRISE:SALARY:CURRENCY">[USD]</span> per year</p>
                    </div>
                    
                    <div class="document-footer">
                        <p>Date: <span class="placeholder" data-field="DOCUMENT:DATE">[2025-12-09]</span></p>
                        <p>Signature: _________________________</p>
                    </div>
                `;
                break;
                
            case 'pay-slip':
                templateHtml = `
                    <div class="document-header">
                        <h3 class="document-title">PAY SLIP</h3>
                        <p class="document-subtitle">Period: December 2025 | Employee ID: <span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:ID">[EMP-001]</span></p>
                    </div>
                    
                    <div class="document-section">
                        <h4>EMPLOYEE DETAILS</h4>
                        <table class="data-table">
                            <tr>
                                <td>Name:</td>
                                <td><span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:FULL_NAME">[Employee Name]</span></td>
                            </tr>
                            <tr>
                                <td>Position:</td>
                                <td><span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:POSITION">[Position]</span></td>
                            </tr>
                            <tr>
                                <td>Department:</td>
                                <td><span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:DEPARTMENT">[Department]</span></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="document-section">
                        <h4>EARNINGS</h4>
                        <table class="data-table">
                            <tr>
                                <td>Basic Salary:</td>
                                <td><span class="placeholder" data-field="ENTERPRISE:SALARY:BASE">[85000]</span> <span class="placeholder" data-field="ENTERPRISE:SALARY:CURRENCY">[USD]</span></td>
                            </tr>
                            <tr>
                                <td>Bonus:</td>
                                <td>5,000 <span class="placeholder" data-field="ENTERPRISE:SALARY:CURRENCY">[USD]</span></td>
                            </tr>
                            <tr>
                                <td><strong>Total Gross:</strong></td>
                                <td><strong>90,000 <span class="placeholder" data-field="ENTERPRISE:SALARY:CURRENCY">[USD]</span></strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="document-section">
                        <h4>DEDUCTIONS</h4>
                        <table class="data-table">
                            <tr>
                                <td>Tax (13%):</td>
                                <td>11,700 <span class="placeholder" data-field="ENTERPRISE:SALARY:CURRENCY">[USD]</span></td>
                            </tr>
                            <tr>
                                <td>Social Security:</td>
                                <td>2,500 <span class="placeholder" data-field="ENTERPRISE:SALARY:CURRENCY">[USD]</span></td>
                            </tr>
                            <tr>
                                <td><strong>Total Deductions:</strong></td>
                                <td><strong>14,200 <span class="placeholder" data-field="ENTERPRISE:SALARY:CURRENCY">[USD]</span></strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="document-section">
                        <h4>NET PAY</h4>
                        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                            <h2 style="color: #28a745; margin: 0;">
                                75,800 <span class="placeholder" data-field="ENTERPRISE:SALARY:CURRENCY">[USD]</span>
                            </h2>
                            <p style="color: #586069; margin-top: 5px;">Amount payable</p>
                        </div>
                    </div>
                    
                    <div class="document-footer">
                        <p>Payment Date: <span class="placeholder" data-field="DOCUMENT:DATE">[2025-12-09]</span></p>
                        <p>Authorized Signature: _________________________</p>
                    </div>
                `;
                break;

			case 'id-card':
				templateHtml = `
					<div class="document-header" style="text-align: center;">
						<h3 class="document-title" style="color: #0366d6;">EMPLOYEE ID CARD</h3>
						<p class="document-subtitle">Valid through: December 2026</p>
					</div>
					
					<div style="display: flex; gap: 40px; margin: 40px 0;">
						<!-- Left: Photo and basic info -->
						<div style="flex: 1; text-align: center;">
							<div style="width: 150px; height: 180px; background: #f0f0f0; border-radius: 8px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
								<i class="fas fa-user" style="font-size: 4rem; color: #6c757d;"></i>
							</div>
							<div style="margin-bottom: 30px;">
								<h4 style="color: #24292e; margin-bottom: 5px;">
									<span class="placeholder highlighted" data-field="ENTERPRISE:EMPLOYEE:FULL_NAME">[Employee Name]</span>
								</h4>
								<p style="color: #586069; margin-bottom: 5px;">
									<span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:POSITION">[Position]</span>
								</p>
								<p style="color: #0366d6; font-weight: 500;">
									ID: <span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:ID">[EMP-001]</span>
								</p>
							</div>
							
							<!-- QR Code placeholder -->
							<div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e1e4e8; display: inline-block;">
								<div style="width: 100px; height: 100px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
									<i class="fas fa-qrcode" style="font-size: 2.5rem; color: #6c757d;"></i>
								</div>
								<p style="font-size: 0.8rem; color: #586069; margin-top: 8px;">Scan for verification</p>
							</div>
						</div>
						
						<!-- Right: Detailed info -->
						<div style="flex: 1;">
							<div class="document-section">
								<h4>PERSONAL INFORMATION</h4>
								<table class="data-table">
									<tr>
										<td>Global ID:</td>
										<td><span class="placeholder" data-field="GLOBAL:IDENTIFIER:GUID">[GUID]</span></td>
									</tr>
									<tr>
										<td>Passport:</td>
										<td>
											<span class="placeholder" data-field="NATIONAL:RU:PASSPORT:SERIES">[1234]</span>
											<span class="placeholder" data-field="NATIONAL:RU:PASSPORT:NUMBER">[567890]</span>
										</td>
									</tr>
									<tr>
										<td>Tax ID:</td>
										<td><span class="placeholder" data-field="NATIONAL:RU:TAX:INN">[770112345678]</span></td>
									</tr>
									<tr>
										<td>Department:</td>
										<td><span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:DEPARTMENT">[Department]</span></td>
									</tr>
									<tr>
										<td>Hire Date:</td>
										<td>2025-12-09</td>
									</tr>
								</table>
							</div>
							
							<div class="document-section">
								<h4>CONTACT</h4>
								<p>Email: employee@company.com</p>
								<p>Phone: +7 (XXX) XXX-XXXX</p>
								<p>Office: Main Building, Floor 3</p>
							</div>
						</div>
					</div>
					
					<div class="document-footer" style="text-align: center; border-top: 2px solid #eaecef; padding-top: 20px;">
						<p>This card is property of [Company Name]. If found, please return.</p>
						<p style="font-size: 0.9rem; color: #586069;">Issued: <span class="placeholder" data-field="DOCUMENT:DATE">[2025-12-09]</span></p>
					</div>
				`;
				break;

			case 'presentation':
				templateHtml = `
					<div class="document-header" style="text-align: center;">
						<h3 class="document-title" style="color: #6f42c1;">EMPLOYEE OVERVIEW PRESENTATION</h3>
						<p class="document-subtitle">Quarterly Performance Review - Q4 2025</p>
					</div>
					
					<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0;">
						<!-- Slide 1: Basic Info -->
						<div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #0366d6;">
							<h4 style="color: #0366d6; margin-bottom: 15px;">Slide 1: Employee Profile</h4>
							<div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
								<div style="width: 80px; height: 80px; background: #0366d6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
									<i class="fas fa-user" style="font-size: 2rem; color: white;"></i>
								</div>
								<div>
									<h3 style="margin: 0; color: #24292e;">
										<span class="placeholder highlighted" data-field="ENTERPRISE:EMPLOYEE:FULL_NAME">[Employee Name]</span>
									</h3>
									<p style="color: #586069; margin: 5px 0;">
										<span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:POSITION">[Position]</span>
									</p>
									<p style="color: #0366d6; font-weight: 500;">
										ID: <span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:ID">[EMP-001]</span>
									</p>
								</div>
							</div>
							<table class="data-table">
								<tr>
									<td>Department:</td>
									<td><span class="placeholder" data-field="ENTERPRISE:EMPLOYEE:DEPARTMENT">[Department]</span></td>
								</tr>
								<tr>
									<td>Hire Date:</td>
									<td>2025-12-09</td>
								</tr>
								<tr>
									<td>Global ID:</td>
									<td><span class="placeholder" data-field="GLOBAL:IDENTIFIER:GUID">[GUID]</span></td>
								</tr>
							</table>
						</div>
						
						<!-- Slide 2: Performance -->
						<div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #28a745;">
							<h4 style="color: #28a745; margin-bottom: 15px;">Slide 2: Performance Metrics</h4>
							<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
								<div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
									<div style="font-size: 2rem; color: #28a745; font-weight: 700;">95%</div>
									<div style="color: #586069; font-size: 0.9rem;">Performance Score</div>
								</div>
								<div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
									<div style="font-size: 2rem; color: #17a2b8; font-weight: 700;">100%</div>
									<div style="color: #586069; font-size: 0.9rem;">Attendance</div>
								</div>
							</div>
							<div style="background: white; padding: 15px; border-radius: 8px;">
								<h5 style="margin: 0 0 10px 0; color: #24292e;">Quarterly Goals</h5>
								<ul style="margin: 0; padding-left: 20px; color: #586069;">
									<li>Complete Project Alpha ✓</li>
									<li>Team Training Completed ✓</li>
									<li>Client Satisfaction: 98% ✓</li>
								</ul>
							</div>
						</div>
						
						<!-- Slide 3: Compensation -->
						<div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #fd7e14; grid-column: span 2;">
							<h4 style="color: #fd7e14; margin-bottom: 15px;">Slide 3: Compensation & Benefits</h4>
							<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
								<div style="text-align: center;">
									<div style="font-size: 1.8rem; color: #24292e; font-weight: 700;">
										<span class="placeholder" data-field="ENTERPRISE:SALARY:BASE">[85000]</span>
									</div>
									<div style="color: #586069;">Base Salary</div>
									<div style="color: #0366d6; font-size: 0.9rem;">
										<span class="placeholder" data-field="ENTERPRISE:SALARY:CURRENCY">[USD]</span>/year
									</div>
								</div>
								<div style="text-align: center;">
									<div style="font-size: 1.8rem; color: #24292e; font-weight: 700;">15%</div>
									<div style="color: #586069;">Annual Bonus</div>
									<div style="color: #28a745; font-size: 0.9rem;">Performance-based</div>
								</div>
								<div style="text-align: center;">
									<div style="font-size: 1.8rem; color: #24292e; font-weight: 700;">Full</div>
									<div style="color: #586069;">Benefits Package</div>
									<div style="color: #6f42c1; font-size: 0.9rem;">Health + Retirement</div>
								</div>
							</div>
						</div>
					</div>
					
					<div class="document-footer" style="text-align: center; padding-top: 20px; border-top: 2px solid #eaecef;">
						<p style="color: #586069;">Presentation generated automatically from DOCScoin Standard data</p>
						<p style="font-size: 0.9rem;">Last updated: <span class="placeholder" data-field="DOCUMENT:DATE">[2025-12-09]</span></p>
					</div>
				`;
				break;
			// Add more templates as needed
        }
        
        documentPreview.innerHTML = templateHtml;
    }

    function updatePreview() {
        // Безопасное получение значений из полей
        const safeGetValue = (id, defaultValue = '') => {
            const element = document.getElementById(id);
            return element ? element.value || defaultValue : defaultValue;
        };
        
        // Обновляем sampleData безопасно
        sampleData.employeeName = safeGetValue('employeeName', sampleData.employeeName);
        sampleData.passportSeries = safeGetValue('ruPassportSeries', sampleData.passportSeries);
        sampleData.passportNumber = safeGetValue('ruPassportNumber', sampleData.passportNumber);
        sampleData.inn = safeGetValue('ruINN', sampleData.inn);
        sampleData.position = safeGetValue('position', sampleData.position);
        sampleData.salary = safeGetValue('salary', sampleData.salary);
        sampleData.currency = safeGetValue('currency', sampleData.currency);
        sampleData.employeeId = safeGetValue('employeeId', sampleData.employeeId);
        sampleData.department = safeGetValue('department', sampleData.department);
        
        // Обновляем GUID если поле существует
        const globalIdField = document.getElementById('globalId');
        if (globalIdField && !globalIdField.value) {
            globalIdField.value = generateUUID();
        }
        
        // Update all placeholders in the document
        const placeholders = documentPreview.querySelectorAll('.placeholder');
        placeholders.forEach(placeholder => {
            const fieldCode = placeholder.getAttribute('data-field');
            if (fieldCode && fieldMapping[fieldCode]) {
                const value = fieldMapping[fieldCode]();
                if (value) {
                    placeholder.textContent = value;
                    
                    // Check if it's a highlighted field
                    if (placeholder.classList.contains('highlighted')) {
                        if (value.startsWith('[')) {
                            placeholder.style.background = '#f8d7da';
                            placeholder.style.color = '#721c24';
                            placeholder.style.borderColor = '#f5c6cb';
                        } else {
                            placeholder.style.background = '#d4edda';
                            placeholder.style.color = '#155724';
                            placeholder.style.borderColor = '#c3e6cb';
                        }
                    }
                }
            }
        });
        
        updateFieldStatus();
    }

    function updateFieldStatus() {
        fieldsList.innerHTML = '';
        
        // Get selected standard
        const selectedStandard = document.querySelector('input[name="standard"]:checked').value;
        
        // Define fields based on standard
        let fields = [];
        
        switch(selectedStandard) {
            case 'global':
                fields = ['GLOBAL:IDENTIFIER:GUID'];
                break;
            case 'national':
                fields = [
                    'NATIONAL:RU:PASSPORT:SERIES',
                    'NATIONAL:RU:PASSPORT:NUMBER',
                    'NATIONAL:RU:TAX:INN'
                ];
                break;
            case 'enterprise':
                fields = [
                    'ENTERPRISE:EMPLOYEE:FULL_NAME',
                    'ENTERPRISE:EMPLOYEE:ID',
                    'ENTERPRISE:EMPLOYEE:POSITION',
                    'ENTERPRISE:SALARY:BASE',
                    'ENTERPRISE:SALARY:CURRENCY'
                ];
                break;
            case 'all':
                fields = Object.keys(fieldMapping);
                break;
        }
        
        // Create field status items
        fields.forEach(fieldCode => {
            const value = fieldMapping[fieldCode] ? fieldMapping[fieldCode]() : '';
            const hasValue = value && !value.startsWith('[');
            
            const fieldItem = document.createElement('div');
            fieldItem.className = `field-item ${hasValue ? '' : 'missing'}`;
            fieldItem.innerHTML = `
                <i class="fas ${hasValue ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${fieldCode}</span>
            `;
            
            fieldsList.appendChild(fieldItem);
        });
    }

    function loadSampleData() {
        document.getElementById('employeeName').value = sampleData.employeeName;
        document.getElementById('passportSeries').value = sampleData.passportSeries;
        document.getElementById('passportNumber').value = sampleData.passportNumber;
        document.getElementById('inn').value = sampleData.inn;
        document.getElementById('position').value = sampleData.position;
        document.getElementById('salary').value = sampleData.salary;
        document.getElementById('currency').value = sampleData.currency;
        
        showStatus('Sample data loaded successfully!', 'success');
        updatePreview();
    }

    // Generation functions
    function generatePdf() {
		showStatus('Generating PDF document...', 'info');
		
		// В реальном проекте здесь был бы jsPDF
		// Но для демо создадим правильный текстовый файл
		
		const content = generateDocumentContent('pdf');
		const selectedTemplate = document.querySelector('input[name="template"]:checked').value;
		const templateNames = {
			'employment-contract': 'Employment_Contract',
			'pay-slip': 'Pay_Slip', 
			'id-card': 'ID_Card',
			'presentation': 'Presentation'
		};
		
		setTimeout(() => {
			showStatus('PDF document generated successfully!', 'success');
			
			// Создаем текстовый файл (в реальности был бы PDF)
			const element = document.createElement('a');
			const filename = `DOCScoin_${templateNames[selectedTemplate]}_${Date.now()}.txt`;
			
			// Добавим заголовок что это демо-версия
			const demoContent = `============================================
	DOCScoin Document - DEMO VERSION
	============================================
	Note: In a production environment, this would be a real PDF file
	generated using jsPDF library with proper formatting.

	============================================
	DOCUMENT CONTENT:
	============================================

	${content}

	============================================
	METADATA:
	============================================
	Generated: ${new Date().toISOString()}
	Template: ${selectedTemplate}
	Standard: DOCScoin v1.0.0
	Generator: Web Interface Demo
	============================================`;

			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + 
				encodeURIComponent(demoContent));
			element.setAttribute('download', filename);
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
		}, 1500);
	}

    function generateDoc() {
        showStatus('Generating Word document...', 'info');
        
        // For Word, we can generate a simple text file or use a template
        const content = generateDocumentContent('word');
        
        setTimeout(() => {
            showStatus('Word document generated successfully!', 'success');
            
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + 
                encodeURIComponent(content));
            element.setAttribute('download', `DOCScoin_Contract_${Date.now()}.doc`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }, 1500);
    }

    function generateExcel() {
        showStatus('Generating Excel spreadsheet...', 'info');
        
        // Generate CSV content
        const csvContent = generateCsvContent();
        
        setTimeout(() => {
            showStatus('Excel file generated successfully!', 'success');
            
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/csv;charset=utf-8,' + 
                encodeURIComponent(csvContent));
            element.setAttribute('download', `DOCScoin_Data_${Date.now()}.csv`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }, 1500);
    }

    function generateJson() {
        showStatus('Generating JSON data...', 'info');
        
        // Generate DOCScoin JSON according to our standard
        const docData = generateDOCScoinJson();
        
        setTimeout(() => {
            showStatus('JSON data exported successfully!', 'success');
            
            const element = document.createElement('a');
            element.setAttribute('href', 'data:application/json;charset=utf-8,' + 
                encodeURIComponent(JSON.stringify(docData, null, 2)));
            element.setAttribute('download', `DOCScoin_Profile_${Date.now()}.json`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }, 1000);
    }

    function generateDocumentContent(format) {
        const selectedTemplate = document.querySelector('input[name="template"]:checked').value;
        let content = '';
        
        switch(selectedTemplate) {
            case 'employment-contract':
                content = `
EMPLOYMENT CONTRACT
===================

Contract ID: ${fieldMapping['DOCUMENT:NUMBER']()}

PARTIES:
--------
This Employment Contract is made between:

Employer: [Company Name]
Employee: ${fieldMapping['ENTERPRISE:EMPLOYEE:FULL_NAME']()}

EMPLOYEE INFORMATION:
--------------------
Passport: ${fieldMapping['NATIONAL:RU:PASSPORT:SERIES']()} ${fieldMapping['NATIONAL:RU:PASSPORT:NUMBER']()}
Tax ID (INN): ${fieldMapping['NATIONAL:RU:TAX:INN']()}
Employee ID: ${fieldMapping['ENTERPRISE:EMPLOYEE:ID']()}
Position: ${fieldMapping['ENTERPRISE:EMPLOYEE:POSITION']()}
Department: ${fieldMapping['ENTERPRISE:EMPLOYEE:DEPARTMENT']()}

COMPENSATION:
-------------
Base Salary: ${fieldMapping['ENTERPRISE:SALARY:BASE']()} ${fieldMapping['ENTERPRISE:SALARY:CURRENCY']()} per year

TERMS AND CONDITIONS:
---------------------
[Standard employment terms here]

Date: ${fieldMapping['DOCUMENT:DATE']()}
Signature: _________________________

Generated by DOCScoin Standard Document Generator
`;
                break;
        }
        
        return content;
    }

    function generateCsvContent() {
        return `Field,Value
Global ID,${fieldMapping['GLOBAL:IDENTIFIER:GUID']()}
Employee Name,${fieldMapping['ENTERPRISE:EMPLOYEE:FULL_NAME']()}
Passport Series,${fieldMapping['NATIONAL:RU:PASSPORT:SERIES']()}
Passport Number,${fieldMapping['NATIONAL:RU:PASSPORT:NUMBER']()}
Tax ID,${fieldMapping['NATIONAL:RU:TAX:INN']()}
Employee ID,${fieldMapping['ENTERPRISE:EMPLOYEE:ID']()}
Position,${fieldMapping['ENTERPRISE:EMPLOYEE:POSITION']()}
Department,${fieldMapping['ENTERPRISE:EMPLOYEE:DEPARTMENT']()}
Salary,${fieldMapping['ENTERPRISE:SALARY:BASE']()}
Currency,${fieldMapping['ENTERPRISE:SALARY:CURRENCY']()}
Generated,${new Date().toISOString()}
`;
    }

    function generateDOCScoinJson() {
        return {
            "$schema": "../specification/schemas/global-profile.json",
            "version": "1.0.0",
            "global_unique_id": fieldMapping['GLOBAL:IDENTIFIER:GUID'](),
            "international_status": {
                "verification_level": "ENHANCED",
                "data_protection_level": ["GDPR"]
            },
            "national_data": {
                "ru": {
                    "passport": {
                        "series": fieldMapping['NATIONAL:RU:PASSPORT:SERIES'](),
                        "number": fieldMapping['NATIONAL:RU:PASSPORT:NUMBER']()
                    },
                    "inn": fieldMapping['NATIONAL:RU:TAX:INN']()
                }
            },
            "enterprise_data": {
                "employee": {
                    "employee_id": fieldMapping['ENTERPRISE:EMPLOYEE:ID'](),
                    "position": fieldMapping['ENTERPRISE:EMPLOYEE:POSITION']()
                },
                "compensation": {
                    "base_salary": {
                        "amount": parseFloat(fieldMapping['ENTERPRISE:SALARY:BASE']()),
                        "currency": fieldMapping['ENTERPRISE:SALARY:CURRENCY']()
                    }
                }
            },
            "generated": new Date().toISOString(),
            "generator": "DOCScoin Web Interface v1.0"
        };
    }

    function showStatus(message, type = 'info') {
        statusMessage.className = 'status-message';
        
        switch(type) {
            case 'success':
                statusMessage.style.background = '#d4edda';
                statusMessage.style.color = '#155724';
                statusMessage.style.borderColor = '#c3e6cb';
                break;
            case 'error':
                statusMessage.style.background = '#f8d7da';
                statusMessage.style.color = '#721c24';
                statusMessage.style.borderColor = '#f5c6cb';
                break;
            case 'info':
            default:
                statusMessage.style.background = '#d1ecf1';
                statusMessage.style.color = '#0c5460';
                statusMessage.style.borderColor = '#bee5eb';
        }
        
        statusText.textContent = message;
        statusMessage.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
	
	// ============================================
// РАБОТА С ЗАЯВКАМИ
// ============================================

// Хранилище заявок (в реальности на бэкенде)
let requestsDB = {
    nextId: 1,
    requests: [],
    loadFromStorage() {
        const saved = localStorage.getItem('docscoin_requests');
        if (saved) {
            const data = JSON.parse(saved);
            this.nextId = data.nextId || 1;
            this.requests = data.requests || [];
        }
    },
    saveToStorage() {
        localStorage.setItem('docscoin_requests', JSON.stringify({
            nextId: this.nextId,
            requests: this.requests
        }));
    },
    createRequest(data) {
        const request = {
            id: `REQ-${new Date().getFullYear()}-${String(this.nextId).padStart(3, '0')}`,
            ...data,
            created: new Date().toISOString(),
            status: 'pending',
            blockchain_tx: null,
            files: [],
            updates: []
        };
        
        this.requests.push(request);
        this.nextId++;
        this.saveToStorage();
        
        return request;
    },
    getRequest(id) {
        return this.requests.find(r => r.id === id);
    },
    updateRequest(id, updates) {
        const index = this.requests.findIndex(r => r.id === id);
        if (index !== -1) {
            this.requests[index] = { ...this.requests[index], ...updates };
            this.saveToStorage();
            return this.requests[index];
        }
        return null;
    },
    getMyRequests(employerId) {
        return this.requests.filter(r => r.employer_id === employerId);
    }
};

// Инициализация
requestsDB.loadFromStorage();

// DOM элементы для модальных окон
let currentStep = 1;
let currentRequestData = {};

// Инициализация модальных окон
function initRequestModals() {
    // Кнопки открытия
    const exportPwidBtn = document.getElementById('generatePwid');
    const closeRequestBtn = document.getElementById('closeRequestBtnGlobal'); // Добавьте эту кнопку в HTML
    
    // Модальные окна
    const createModal = document.getElementById('createRequestModal');
    const closeModal = document.getElementById('closeRequestModal');
    const successModal = document.getElementById('successModal');
    
    // Кнопки закрытия
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            resetRequestForm();
        });
    });
    
    // Клик вне модального окна
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            resetRequestForm();
        }
    });
    
    // Кнопка "Export as .pwid" (добавьте её в generation-buttons)
    if (exportPwidBtn) {
        exportPwidBtn.addEventListener('click', () => {
            createModal.style.display = 'block';
            initRequestForm();
        });
    }
    
    // Кнопка "Close Request" (добавьте отдельную кнопку)
    if (closeRequestBtn) {
        closeRequestBtn.addEventListener('click', () => {
            closeModal.style.display = 'block';
            loadMyRequests();
        });
    }
    
    // Табы авторизации
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchAuthTab(tabName);
        });
    });
    
    // Табы действий
    document.querySelectorAll('.action-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const action = tab.getAttribute('data-action');
            switchActionTab(action);
        });
    });
    
    // Навигация по шагам
    document.getElementById('nextStepBtn').addEventListener('click', goToNextStep);
    document.getElementById('prevStepBtn').addEventListener('click', goToPrevStep);
    document.getElementById('submitRequestBtn').addEventListener('click', submitRequest);
    document.getElementById('closeRequestBtn').addEventListener('click', submitCloseRequest);
    
    // Загрузка сертификата
    document.getElementById('certificateFile').addEventListener('change', handleCertificateUpload);
    
    // Выбор заявки
    document.getElementById('requestIdSelect').addEventListener('change', handleRequestSelect);
}

// Переключение табов авторизации
function switchAuthTab(tabName) {
    // Обновляем активный таб
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Показываем нужный контент
    document.querySelectorAll('.auth-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Auth`).classList.add('active');
    
    // Сохраняем тип авторизации
    currentRequestData.auth_type = tabName;
}

// Переключение табов действий
function switchActionTab(action) {
    document.querySelectorAll('.action-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-action') === action) {
            tab.classList.add('active');
        }
    });
    
    document.querySelectorAll('.action-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${action}Action`).classList.add('active');
}

// Навигация по шагам
function goToNextStep() {
    if (validateCurrentStep()) {
        currentStep++;
        updateRequestForm();
    }
}

function goToPrevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateRequestForm();
    }
}

// Обновление формы заявки
function updateRequestForm() {
    // Скрываем все шаги
    document.querySelectorAll('.request-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Показываем текущий шаг
    document.getElementById(`${['auth', 'details', 'confirm'][currentStep-1]}Step`).classList.add('active');
    
    // Обновляем индикаторы
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        if (index + 1 === currentStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // Обновляем кнопки
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    const submitBtn = document.getElementById('submitRequestBtn');
    
    prevBtn.disabled = currentStep === 1;
    
    if (currentStep === 3) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        updateConfirmationDetails();
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

// Обновление деталей подтверждения
function updateConfirmationDetails() {
    document.getElementById('confirmAuthType').textContent = 
        currentRequestData.auth_type === 'certificate' ? 'Сертификат' : 'Логин/Пароль';
    
    document.getElementById('confirmEmployerId').textContent = 
        currentRequestData.employer_id || '-';
    
    const purposeSelect = document.getElementById('requestPurpose');
    document.getElementById('confirmPurpose').textContent = 
        purposeSelect.options[purposeSelect.selectedIndex].text;
    
    const accessRadio = document.querySelector('input[name="accessLevel"]:checked');
    document.getElementById('confirmAccess').textContent = 
        accessRadio ? accessRadio.nextElementSibling.textContent : 'Базовый';
}

// Валидация шага
function validateCurrentStep() {
    if (currentStep === 1) {
        // Валидация авторизации
        if (currentRequestData.auth_type === 'certificate') {
            const certFile = document.getElementById('certificateFile');
            if (!certFile.files.length) {
                alert('Пожалуйста, загрузите сертификат');
                return false;
            }
        } else {
            const login = document.getElementById('employerLogin').value;
            const password = document.getElementById('employerPassword').value;
            const employerId = document.getElementById('employerId').value;
            
            if (!login || !password || !employerId) {
                alert('Пожалуйста, заполните все поля');
                return false;
            }
            
            currentRequestData.employer_login = login;
            currentRequestData.employer_id = employerId;
        }
    } else if (currentStep === 2) {
        // Валидация деталей
        const purpose = document.getElementById('requestPurpose').value;
        if (!purpose) {
            alert('Пожалуйста, укажите цель запроса');
            return false;
        }
        
        currentRequestData.purpose = purpose;
        currentRequestData.access_level = document.querySelector('input[name="accessLevel"]:checked').value;
        currentRequestData.comment = document.getElementById('requestComment').value;
    } else if (currentStep === 3) {
        // Валидация соглашения
        if (!document.getElementById('dataAgreement').checked) {
            alert('Пожалуйста, подтвердите соглашение');
            return false;
        }
    }
    
    return true;
}

// Обработка загрузки сертификата
function handleCertificateUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        
        // Парсим PEM сертификат (упрощенно)
        const certInfo = parseCertificateInfo(content);
        
        // Показываем информацию
        const preview = document.getElementById('certificatePreview');
        const infoEl = document.getElementById('certificateInfo');
        
        infoEl.textContent = JSON.stringify(certInfo, null, 2);
        preview.style.display = 'block';
        
		// Сохраняем сертификат
		currentRequestData.certificate = content;
		currentRequestData.employer_id = certInfo.commonName || 
			certInfo.organization || 'UNKNOWN_ORG';
		};

		reader.readAsText(file);
		}

		// Упрощенный парсинг сертификата
		function parseCertificateInfo(pemContent) {
		// В реальном приложении используйте библиотеку типа pkijs или asn1js
		try {
		// Базовый парсинг PEM
		const base64 = pemContent
			.replace(/-----BEGIN CERTIFICATE-----/, '')
			.replace(/-----END CERTIFICATE-----/, '')
			.replace(/\s+/g, '');
			
		const decoded = atob(base64);
			
		// Пытаемся найти данные в DER (упрощенно)
		return {
			format: 'X.509 PEM',
			size: `${pemContent.length} chars`,
			commonName: extractCN(pemContent),
			organization: extractO(pemContent),
			validFrom: new Date().toLocaleDateString(),
			validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
		};
		} catch (e) {
		return {
			error: 'Не удалось прочитать сертификат',
			details: e.message
		};
		}
		}

		function extractCN(pem) {
		const match = pem.match(/CN=([^,\n]+)/);
		return match ? match[1] : 'Не указан';
		}

		function extractO(pem) {
		const match = pem.match(/O=([^,\n]+)/);
		return match ? match[1] : 'Не указана';
		}

		// Отправка заявки
		async function submitRequest() {
		if (!validateCurrentStep()) return;

		// Блокируем кнопку на время обработки
		const submitBtn = document.getElementById('submitRequestBtn');
		submitBtn.disabled = true;
		submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание...';

		try {
		// 1. Получаем данные из формы
		const formData = {
			...currentRequestData,
			personal_data: getPersonalDataForRequest(),
			timestamp: new Date().toISOString(),
			request_id: `REQ-${Date.now()}`
		};

		// 2. Генерируем .pwid файл с шифрованием
		const pwidData = await generateEncryptedPwid(formData);

		// 3. Создаем запись о заявке
		const request = requestsDB.createRequest({
			...formData,
			pwid_hash: await hashData(pwidData),
			status: 'created'
		});

		// 4. Симулируем отправку в блокчейн (в реальности API вызов)
		const txHash = await simulateBlockchainSubmit(request);

		// 5. Показываем успешное окно
		showSuccessModal(request, pwidData, txHash);

		// 6. Сбрасываем форму
		resetRequestForm();

		} catch (error) {
		console.error('Ошибка создания заявки:', error);
		alert(`Ошибка: ${error.message}`);
		} finally {
		submitBtn.disabled = false;
		submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Создать заявку';
		}
		}

		// Получение персональных данных из формы
		function getPersonalDataForRequest() {
		const accessLevel = currentRequestData.access_level || 'basic';
		const data = {};

		// Базовые данные (всегда)
		data.basic = {
			full_name: document.getElementById('fullName').value,
			birth_date: document.getElementById('birthDate').value,
			passport: document.getElementById('passport').value,
			phone: document.getElementById('phone').value,
			email: document.getElementById('email').value
		};

		// Расширенные данные (если выбрано)
		if (accessLevel === 'extended' || accessLevel === 'full') {
			data.extended = {
				education: getEducationData(),
				work_history: getWorkHistory(),
				skills: getSkillsData()
			};
		}

		// Полные данные
		if (accessLevel === 'full') {
			data.full = {
				certificates: getCertificates(),
				languages: getLanguages(),
				additional_info: document.getElementById('additionalInfo').value
			};
		}

		return data;
		}

		// Генерация зашифрованного .pwid
		async function generateEncryptedPwid(formData) {
		// 1. Преобразуем данные в бинарный формат
		const jsonData = JSON.stringify(formData, null, 2);
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(jsonData);

		// 2. Генерируем ключ шифрования
		const cryptoKey = await generateEncryptionKey(formData);

		// 3. Шифруем данные
		let encryptedData;
		if (currentRequestData.auth_type === 'certificate' && currentRequestData.certificate) {
			// Шифрование публичным ключом сертификата (симуляция)
			encryptedData = await simulateCertificateEncryption(dataBuffer, currentRequestData.certificate);
		} else {
			// Шифрование симметричным ключом (для демо)
			encryptedData = await symmetricEncrypt(dataBuffer, cryptoKey);
		}

		// 4. Создаем структуру .pwid файла
		const pwidStructure = {
			version: '1.0',
			format: 'DOCScoin Personal Data',
			timestamp: new Date().toISOString(),
			request_id: formData.request_id,
			employer_id: formData.employer_id,
			data_encrypted: true,
			encryption_method: currentRequestData.auth_type === 'certificate' ? 'RSA-OAEP' : 'AES-GCM',
			data: btoa(String.fromCharCode(...new Uint8Array(encryptedData))), // Base64
			signature: await generateSignature(encryptedData, formData.request_id),
			metadata: {
				access_level: formData.access_level,
				purpose: formData.purpose,
				created_by: 'DOCScoin Generator'
			}
		};

		return JSON.stringify(pwidStructure, null, 2);
		}

		// Вспомогательные функции шифрования (симуляция)
		async function generateEncryptionKey(formData) {
		// В реальном приложении используйте Web Crypto API
		return window.crypto.subtle.generateKey(
			{
				name: "AES-GCM",
				length: 256,
			},
			true,
			["encrypt", "decrypt"]
		);
		}

		async function simulateCertificateEncryption(data, certificate) {
		// Симуляция RSA шифрования
		// В реальности нужно использовать Web Crypto API с импортом сертификата
		return new Uint8Array(data);
		}

		async function symmetricEncrypt(data, key) {
		const iv = window.crypto.getRandomValues(new Uint8Array(12));
		const encrypted = await window.crypto.subtle.encrypt(
			{
				name: "AES-GCM",
				iv: iv
			},
			key,
			data
		);

		// Объединяем IV и зашифрованные данные
		const result = new Uint8Array(iv.length + encrypted.byteLength);
		result.set(iv);
		result.set(new Uint8Array(encrypted), iv.length);

		return result;
		}

		async function generateSignature(data, requestId) {
		// Генерация подписи для верификации
		const key = await window.crypto.subtle.generateKey(
			{ name: "HMAC", hash: "SHA-256" },
			true,
			["sign", "verify"]
		);

		const signature = await window.crypto.subtle.sign(
			"HMAC",
			key,
			data
		);

		return btoa(String.fromCharCode(...new Uint8Array(signature)));
		}

		async function hashData(data) {
		const encoder = new TextEncoder();
		const hashBuffer = await window.crypto.subtle.digest(
			'SHA-256',
			encoder.encode(data)
		);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
		}

		async function simulateBlockchainSubmit(request) {
		// Симуляция отправки в блокчейн
		// В реальности: вызов смарт-контракта или API ноды
		return new Promise(resolve => {
			setTimeout(() => {
				const txHash = '0x' + Array.from(
					{length: 64}, 
					() => Math.floor(Math.random() * 16).toString(16)
				).join('');
				
				// Обновляем запись в базе
				requestsDB.updateRequest(request.id, {
					blockchain_tx: txHash,
					status: 'submitted'
				});
				
				resolve(txHash);
			}, 1500);
		});
		}

		// Показ окна успеха
		function showSuccessModal(request, pwidData, txHash) {
		// Заполняем данные
		document.getElementById('successRequestId').textContent = request.id;
		document.getElementById('successCloseLink').textContent = 
			`${window.location.origin}/close/${request.id}`;

		// Создаем ссылку для скачивания
		const blob = new Blob([pwidData], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const downloadLink = document.getElementById('successDownloadLink');
		downloadLink.href = url;
		downloadLink.download = `${request.id}.pwid`;

		// Настраиваем кнопку просмотра в блокчейне
		document.getElementById('viewBlockchainBtn').onclick = () => {
			window.open(`https://testnet.docscoin.org/tx/${txHash}`, '_blank');
		};

		// Показываем модальное окно
		document.getElementById('createRequestModal').style.display = 'none';
		document.getElementById('successModal').style.display = 'block';
		}

		// ЗАКРЫТИЕ ЗАЯВКИ

		// Загрузка моих заявок
		function loadMyRequests() {
		const select = document.getElementById('requestIdSelect');
		select.innerHTML = '<option value="">-- Выберите ID заявки --</option>';

		// В реальности: загрузка по employer_id
		const myRequests = requestsDB.requests.filter(r => 
			r.status === 'submitted' || r.status === 'pending'
		);

		myRequests.forEach(request => {
			const option = document.createElement('option');
			option.value = request.id;
			option.textContent = `${request.id} - ${request.purpose} (${new Date(request.created).toLocaleDateString()})`;
			select.appendChild(option);
		});
		}

		// Выбор заявки
		function handleRequestSelect(event) {
		const requestId = event.target.value;
		const infoEl = document.getElementById('selectedRequestInfo');

		if (!requestId) {
			infoEl.style.display = 'none';
			return;
		}

		const request = requestsDB.getRequest(requestId);
		if (request) {
			document.getElementById('infoRequestId').textContent = request.id;
			document.getElementById('infoRequestDate').textContent = 
				new Date(request.created).toLocaleString();
			document.getElementById('infoRequestStatus').textContent = 
				getStatusText(request.status);
			document.getElementById('infoRequestPurpose').textContent = request.purpose;
			
			infoEl.style.display = 'block';
		} else {
			infoEl.style.display = 'none';
		}
		}

		function getStatusText(status) {
		const statusMap = {
			'pending': '⏳ Ожидает',
			'submitted': '✅ Отправлена',
			'closed': '🔒 Закрыта',
			'rejected': '❌ Отказ'
		};
		return statusMap[status] || status;
		}

		// Отправка закрытия заявки
		async function submitCloseRequest() {
		const requestId = document.getElementById('requestIdSelect').value;
		const action = document.querySelector('.action-tab.active').getAttribute('data-action');
		const centerCert = document.getElementById('centerCertificate').files[0];

		if (!requestId) {
			alert('Выберите заявку');
			return;
		}

		if (!centerCert) {
			alert('Загрузите сертификат центра');
			return;
		}

		const request = requestsDB.getRequest(requestId);
		if (!request) {
			alert('Заявка не найдена');
			return;
		}

		// Блокируем кнопку
		const submitBtn = document.getElementById('closeRequestBtn');
		submitBtn.disabled = true;
		submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';

		try {
			let responseData;
			
			if (action === 'update') {
				// Обновление данных
				const pwidFile = document.getElementById('updatePwidFile').files[0];
				if (!pwidFile) {
					alert('Загрузите обновленный .pwid файл');
					return;
				}
				
				responseData = await createUpdateResponse(request, pwidFile);
			} else {
				// Отказ
				const reason = document.getElementById('rejectReason').value;
				const details = document.getElementById('rejectDetails').value;
				
				responseData = await createRejectionResponse(request, reason, details);
			}
			
			// Шифруем ответ сертификатом центра
			const encryptedResponse = await encryptForCenter(responseData, await readFileAsText(centerCert));
			
			// Обновляем статус заявки
			requestsDB.updateRequest(requestId, {
				status: action === 'update' ? 'closed' : 'rejected',
				closed_at: new Date().toISOString(),
				close_action: action,
				close_data: responseData
			});
			
			// Симулируем отправку в блокчейн
			await simulateBlockchainClose(requestId, action);
			
			// Показываем успех
			alert(`Заявка ${requestId} успешно закрыта!`);
			document.getElementById('closeRequestModal').style.display = 'none';
			
		} catch (error) {
			console.error('Ошибка закрытия заявки:', error);
			alert(`Ошибка: ${error.message}`);
		} finally {
			submitBtn.disabled = false;
			submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Отправить ответ';
		}
		}

		async function createUpdateResponse(request, pwidFile) {
		// Читаем обновленный файл
		const fileContent = await readFileAsText(pwidFile);
			
		return {
			type: 'update',
			request_id: request.id,
			original_pwid_hash: request.pwid_hash,
			new_pwid_hash: await hashData(fileContent),
			timestamp: new Date().toISOString(),
			comment: document.getElementById('updateComment').value,
			data_preview: await extractPreviewData(fileContent)
		};
		}

		async function createRejectionResponse(request, reason, details) {
		return {
			type: 'rejection',
			request_id: request.id,
			reason: reason,
			details: details,
			timestamp: new Date().toISOString(),
			employer_id: request.employer_id,
			candidate_data: {
				name: request.personal_data?.basic?.full_name || 'Не указано',
				// Можно добавить другую информацию (без персональных данных)
			}
		};
		}

		async function encryptForCenter(data, certificate) {
		// Шифрование публичным ключом центра
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(JSON.stringify(data));
			
		// В реальности используйте сертификат центра для RSA шифрования
		return btoa(String.fromCharCode(...new Uint8Array(dataBuffer)));
		}

		async function extractPreviewData(pwidContent) {
		try {
			const data = JSON.parse(pwidContent);
			return {
				metadata: data.metadata,
				data_encrypted: data.data_encrypted,
				timestamp: data.timestamp
			};
		} catch {
			return { error: 'Не удалось прочитать файл' };
		}
		}

		function readFileAsText(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = e => resolve(e.target.result);
			reader.onerror = reject;
			reader.readAsText(file);
		});
		}

		async function simulateBlockchainClose(requestId, action) {
		// Симуляция записи в блокчейн
		return new Promise(resolve => {
			setTimeout(() => {
				console.log(`Заявка ${requestId} закрыта в блокчейне (${action})`);
				resolve();
			}, 1000);
		});
		}

		// Сброс формы заявки
		function resetRequestForm() {
		currentStep = 1;
		currentRequestData = {};
			
		// Сбрасываем UI
		document.querySelectorAll('.request-step').forEach((step, index) => {
			step.classList.remove('active');
			if (index === 0) step.classList.add('active');
		});
			
		document.querySelectorAll('.step-dot').forEach((dot, index) => {
			dot.classList.toggle('active', index === 0);
		});
			
		// Сбрасываем форму
		document.getElementById('certificateFile').value = '';
		document.getElementById('employerLogin').value = '';
		document.getElementById('employerPassword').value = '';
		document.getElementById('employerId').value = '';
		document.getElementById('requestPurpose').selectedIndex = 0;
		document.getElementById('requestComment').value = '';
		document.querySelector('input[name="accessLevel"][value="basic"]').checked = true;
		document.getElementById('dataAgreement').checked = false;
		document.getElementById('certificatePreview').style.display = 'none';
			
		// Сбрасываем кнопки
		document.getElementById('prevStepBtn').disabled = true;
		document.getElementById('nextStepBtn').style.display = 'block';
		document.getElementById('submitRequestBtn').style.display = 'none';
		}

		// Инициализация формы
		function initRequestForm() {
		resetRequestForm();
		switchAuthTab('certificate');
		switchActionTab('update');
		}

		// Инициализация при загрузке
		document.addEventListener('DOMContentLoaded', () => {
		initRequestModals();
			
		// Добавляем кнопки заявок в основной интерфейс
		addRequestButtonsToUI();
		});

		// Добавление кнопок заявок в UI
		function addRequestButtonsToUI() {
			const buttonContainer = document.querySelector('.generator-actions');
			if (!buttonContainer) return;
				
			const requestButtons = document.createElement('div');
			requestButtons.className = 'request-buttons';
			requestButtons.innerHTML = `
				<button id="generatePwid" class="request-btn">
					<i class="fas fa-file-export"></i> Export as .pwid (с заявкой)
				</button>
				<button id="closeRequestBtnGlobal" class="request-btn secondary">
					<i class="fas fa-file-import"></i> Закрыть заявку
				</button>
			`;
				
			buttonContainer.appendChild(requestButtons);
		}
});

