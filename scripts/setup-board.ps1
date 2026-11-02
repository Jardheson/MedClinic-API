$ErrorActionPreference = "Stop"
$owner = "Jardheson"
$title = "MedClinic API - Etapa 2"

Write-Host "1/8 Autorizando escopo project..." -ForegroundColor Cyan
gh auth refresh -h github.com -s project

Write-Host "2/8 Criando o projeto..." -ForegroundColor Cyan
gh project create --owner $owner --title $title

$projectNumber = (gh project list --owner $owner --format json | ConvertFrom-Json).projects |
    Where-Object { $_.title -eq $title } | Select-Object -First 1 -ExpandProperty number
$projectId = (gh project view $projectNumber --owner $owner --format json | ConvertFrom-Json).id
$fields = (gh project field-list $projectNumber --owner $owner --format json | ConvertFrom-Json).fields
$statusField = $fields | Where-Object { $_.name -eq "Status" }
$statusFieldId = $statusField.id
$optionId = @{}
foreach ($opt in $statusField.options) { $optionId[$opt.name] = $opt.id }

$cards = @(
    @{ title = "Etapa 1 - Autenticacao, usuarios e RBAC";            status = "Done" },
    @{ title = "Etapa 2 - Contrato /api/v1 e modulos clinicos";      status = "Done" },
    @{ title = "Pacientes por name/cpf com listagem paginada";       status = "Done" },
    @{ title = "Doctors, work-schedule e calendar";                  status = "Done" },
    @{ title = "Consultas com endsAt e lock pessimista";             status = "Done" },
    @{ title = "Prontuario medico com vinculo medico-paciente";      status = "Done" },
    @{ title = "Infra Docker + PostgreSQL 5433 + migrations + seed"; status = "Done" },
    @{ title = "Suite unificada com cobertura de 80%";               status = "Done" },
    @{ title = "CI com Postgres service e publicacao de cobertura";  status = "Done" },
    @{ title = "Publicacao no Render com health check";              status = "Done" }
)

Write-Host "3/8 Criando cards..." -ForegroundColor Cyan
foreach ($card in $cards) {
    gh project item-create $projectNumber --owner $owner --title $card.title | Out-Null
}

Write-Host "4/8 Aplicando Status..." -ForegroundColor Cyan
$items = (gh project item-list $projectNumber --owner $owner --limit 100 --format json | ConvertFrom-Json).items
foreach ($card in $cards) {
    $item = $items | Where-Object { $_.title -eq $card.title } | Select-Object -First 1
    if ($item) {
        gh project item-edit --id $item.id --project-id $projectId `
            --field-id $statusFieldId --single-select-option-id $optionId[$card.status] | Out-Null
    }
}

Write-Host "5/8 Vinculando PR #13..." -ForegroundColor Cyan
gh project item-add $projectNumber --owner $owner --url "https://github.com/Jardheson/MedClinic-API/pull/13"

Write-Host "Board pronto. Numero do projeto: $projectNumber" -ForegroundColor Green
