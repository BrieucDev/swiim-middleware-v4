import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default function ParametresPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-2">
          Configuration de l&apos;enseigne et du compte
        </p>
      </div>

      {/* Enseigne */}
      <Card className="bg-white/90 border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-base font-semibold text-gray-900">Enseigne</CardTitle>
          <CardDescription className="text-sm text-gray-500">Informations sur l&apos;enseigne</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-gray-500">Nom de l&apos;enseigne</Label>
            <Input id="name" defaultValue="FNAC" className="rounded-full border-gray-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo" className="text-sm text-gray-500">Logo</Label>
            <Input id="logo" type="file" accept="image/*" className="rounded-full border-gray-200" />
            <p className="text-xs text-gray-400">
              Format recommandé: PNG, 200x200px
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-500">Email de contact</Label>
            <Input id="email" type="email" defaultValue="contact@fnac.com" className="rounded-full border-gray-200" />
          </div>
          <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800">Enregistrer</Button>
        </CardContent>
      </Card>

      {/* Utilisateurs */}
      <Card className="bg-white/90 border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-base font-semibold text-gray-900">Utilisateurs</CardTitle>
          <CardDescription className="text-sm text-gray-500">Gestion des accès et rôles</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="font-semibold text-gray-900">Admin Swiim</div>
                <div className="text-sm text-gray-500">admin@swiim.com</div>
              </div>
              <Badge variant="default" className="rounded-full">Admin</Badge>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="font-semibold text-gray-900">Manager FNAC</div>
                <div className="text-sm text-gray-500">manager@fnac.com</div>
              </div>
              <Badge variant="secondary" className="rounded-full">Manager</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Opérateur Store</div>
                <div className="text-sm text-gray-500">operateur@fnac.com</div>
              </div>
              <Badge variant="outline" className="rounded-full border-gray-200">Opérateur</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intégrations */}
      <Card className="bg-white/90 border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-base font-semibold text-gray-900">Intégrations</CardTitle>
          <CardDescription className="text-sm text-gray-500">Configuration des intégrations TPE et PSP</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-6">
            <div>
              <div className="font-semibold text-gray-900 mb-2">Terminaux de paiement (TPE)</div>
              <p className="text-sm text-gray-500">
                Les intégrations TPE sont gérées automatiquement via l&apos;API Swiim.
                Les terminaux sont configurés et suivis dans la section &quot;TPE &amp; Clés&quot;.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-6">
              <div className="font-semibold text-gray-900 mb-2">PSP (Processeurs de paiement)</div>
              <p className="text-sm text-gray-500">
                L&apos;intégration avec les processeurs de paiement (Stripe, Square, etc.)
                serait configurée dans cette section pour la production.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

