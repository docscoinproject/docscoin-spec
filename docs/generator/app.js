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
		
		// Всегда показываем глобальные и enterprise поля
		document.getElementById('global-fields').style.display = 'block';
		
		// Показываем/скрываем страны в зависимости от стандарта
		if (selectedStandard === 'national' || selectedStandard === 'all') {
			document.getElementById('country-step').style.display = 'block';
			
			// Показываем поля для выбранной страны
			const allCountryFields = ['ru-fields', 'ua-fields', 'us-fields', 'cn-fields', 'in-fields'];
			allCountryFields.forEach(id => {
				document.getElementById(id).style.display = 'none';
			});
			
			if (selectedCountry === 'multiple') {
				// Показываем мульти-выбор
				document.getElementById('multi-country-select').style.display = 'block';
				
				// Показываем все выбранные страны
				const multiCountries = document.querySelectorAll('input[name="multi-country"]:checked');
				multiCountries.forEach(checkbox => {
					const countryId = checkbox.value + '-fields';
					if (document.getElementById(countryId)) {
						document.getElementById(countryId).style.display = 'block';
					}
				});
			} else if (selectedCountry && selectedCountry !== 'multiple') {
				document.getElementById('multi-country-select').style.display = 'none';
				const countryFields = document.getElementById(selectedCountry + '-fields');
				if (countryFields) {
					countryFields.style.display = 'block';
				}
			}
		} else {
			document.getElementById('country-step').style.display = 'none';
			document.getElementById('multi-country-select').style.display = 'none';
			
			// Скрываем все национальные поля
			['ru-fields', 'ua-fields', 'us-fields', 'cn-fields', 'in-fields'].forEach(id => {
				document.getElementById(id).style.display = 'none';
			});
		}
		
		// Enterprise поля показываем для Enterprise и All
		if (selectedStandard === 'enterprise' || selectedStandard === 'all') {
			document.getElementById('enterprise-fields').style.display = 'block';
		} else {
			document.getElementById('enterprise-fields').style.display = 'none';
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
		standardRadios.forEach(radio => {
			radio.addEventListener('change', function() {
				handleStandardChange();
				updateFieldSections();
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
        // Get current form values
        sampleData.employeeName = document.getElementById('employeeName').value || sampleData.employeeName;
        sampleData.passportSeries = document.getElementById('passportSeries').value || sampleData.passportSeries;
        sampleData.passportNumber = document.getElementById('passportNumber').value || sampleData.passportNumber;
        sampleData.inn = document.getElementById('inn').value || sampleData.inn;
        sampleData.position = document.getElementById('position').value || sampleData.position;
        sampleData.salary = document.getElementById('salary').value || sampleData.salary;
        sampleData.currency = document.getElementById('currency').value || sampleData.currency;
        
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
});